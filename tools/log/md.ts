// Generates the MD library extension/swibh/md/swibh_log.xml from the log schema (ADR 0001).
//
// One library per log event, Log_<Event> (hunt.accept -> Log_HuntAccept), with a named
// param per data field (nullable ones default to null), plus a hunt param for events
// that carry the hunt key. One
// helper per named shape, Json_<Shape>, takes the shape's input as In and returns its
// JSON, so a ship is written the same way everywhere. JSON object keys are written in
// sorted order. MD has no JSON support, so every value is built as text here:
//   int     '%s'.[($x)i]          money   '%s'.[$x] (money prints as integer ct)
//   number  '%s'.[($x)f]          bool    if $x then 'true' else 'false'
//   id/enum '"%s"'.[$x]           name    Json_Name, which cleans the text up first
//   null    a guard on $x == null writes null
import { events, id, MARKER, VERSION, type EventType, type FieldType, type Fields, type Shape } from "./schema.ts";

export const SCRIPT = "SWIBH_Log";

// Locals are capitalised and fields camelCase, so the two never collide
const FIELD_NAME = /^[a-z][A-Za-z0-9]*$/;

// An MD string literal holding text
const lit = (text: string) => `'${text.replace(/\\/g, "\\\\").replace(/'/g, "\\'")}'`;
// An XML attribute value holding an MD expression
const attr = (text: string) =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const eventLibrary = (type: string) =>
  "Log_" + type.split(".").map((part) => part[0].toUpperCase() + part.slice(1)).join("");
const shapeLibrary = (shape: Shape) => `Json_${shape.name}`;
const ref = (library: string) => `md.${SCRIPT}.${library}`;

// Writes MD actions that append JSON to one text variable
class Writer {
  readonly lines: string[] = [];
  private out: string;
  private indent: number;
  constructor(out: string, indent: number) {
    this.out = out;
    this.indent = indent;
  }

  line(text: string) {
    this.lines.push(" ".repeat(this.indent) + text);
  }

  // out = out + <prefix> + <expr>, where prefix is JSON text
  add(prefix: string, expr?: string) {
    const parts = [this.out, ...(prefix ? [lit(prefix)] : []), ...(expr ? [expr] : [])];
    this.line(`<set_value name="${this.out}" exact="${attr(parts.join(" + "))}"/>`);
  }

  nested(open: string, close: string, body: () => void) {
    this.line(open);
    this.indent += 2;
    body();
    this.indent -= 2;
    this.line(close);
  }

  call(library: string, input: string, result: string) {
    this.nested(`<run_actions ref="${ref(library)}" result="${result}">`, "</run_actions>", () =>
      this.line(`<param name="In" value="${attr(input)}"/>`),
    );
  }

  // Appends prefix, then the JSON for expr read as type
  value(type: FieldType, expr: string, prefix: string, depth: number): void {
    switch (type.kind) {
      case "int":
        return this.add(prefix, `'%s'.[(${expr})i]`);
      case "money":
        return this.add(prefix, `'%s'.[${expr}]`);
      case "number":
        return this.add(prefix, `'%s'.[(${expr})f]`);
      case "bool":
        return this.add(prefix, `(if ${expr} then 'true' else 'false')`);
      case "id":
      case "enum":
        return this.add(prefix, `'"%s"'.[${expr}]`);
      case "name":
        this.call("Json_Name", expr, `$V${depth}`);
        return this.add(prefix, `$V${depth}`);
      case "shape":
        this.call(shapeLibrary(type.shape), expr, `$V${depth}`);
        return this.add(prefix, `$V${depth}`);
      case "nullable":
        this.nested(`<do_if value="${attr(`${expr} == null`)}">`, "</do_if>", () => this.add(prefix + "null"));
        this.nested("<do_else>", "</do_else>", () => this.value(type.of, expr, prefix, depth));
        return;
      case "list": {
        const [element, counter] = [`$E${depth}`, `$I${depth}`];
        this.add(prefix + "[");
        this.nested(`<do_for_each name="${element}" in="${attr(expr)}" counter="${counter}">`, "</do_for_each>", () => {
          this.nested(`<do_if value="${counter} gt 1">`, "</do_if>", () => this.add(","));
          this.value(type.of, element, "", depth + 1);
        });
        return this.add("]");
      }
    }
  }

  // Appends {"a":...,"b":...} then suffix, for fields in sorted key order; read(key, type) is each field's MD expression
  object(fields: Fields, read: (key: string, type: FieldType) => string, prefix: string, suffix = "") {
    const keys = Object.keys(fields).sort();
    keys.forEach((key, i) => this.value(fields[key], read(key, fields[key]), `${i ? "," : prefix + "{"}"${key}":`, 1));
    this.add("}" + suffix);
  }
}

function checkNames(fields: Fields, where: string) {
  for (const key of Object.keys(fields)) {
    if (!FIELD_NAME.test(key)) throw new Error(`${where}.${key}: field names are camelCase`);
  }
}

// Every named shape the events use, inner ones first
function shapesOf(types: FieldType[], found: Map<string, Shape> = new Map()): Map<string, Shape> {
  for (const type of types) {
    if (type.kind === "list" || type.kind === "nullable") shapesOf([type.of], found);
    if (type.kind === "shape") {
      const known = found.get(type.shape.name);
      if (known && known !== type.shape) throw new Error(`two shapes are named ${type.shape.name}`);
      shapesOf(Object.values(type.shape.fields), found);
      found.set(type.shape.name, type.shape);
    }
  }
  return found;
}

type Param = { name: string; nullable?: boolean };

function library(name: string, doc: string, params: Param[], body: (w: Writer) => void, out: string) {
  const w = new Writer(out, 8);
  body(w);
  return [
    `    <!-- ${doc} -->`,
    `    <library name="${name}" purpose="run_actions">`,
    "      <params>",
    ...params.map(({ name, nullable }) => `        <param name="${name}"${nullable ? ' default="null"' : ""}/>`),
    "      </params>",
    "      <actions>",
    ...w.lines,
    "      </actions>",
    "    </library>",
  ];
}

const nameHelper = () =>
  library(
    "Json_Name",
    'Display text as a JSON string, after a lossy cleanup: " to \', \\ to /, newline to space',
    [{ name: "In" }],
    (w) => {
      w.line(`<set_value name="$Text" exact="${attr("'%s'.[$In]")}"/>`);
      for (const [from, to] of [["'\"'", "'\\''"], ["'\\\\'", "'/'"], ["'\\n'", "' '"]]) {
        w.nested('<substitute_text text="$Text">', "</substitute_text>", () =>
          w.line(`<replace string="${attr(from)}" with="${attr(to)}"/>`),
        );
      }
      w.line(`<return value="${attr(`'"' + $Text + '"'`)}"/>`);
    },
    "$Json",
  );

const shapeHelper = (shape: Shape) =>
  library(
    shapeLibrary(shape),
    `A ${shape.name} as JSON`,
    [{ name: "In" }],
    (w) => {
      w.line(`<set_value name="$Json" exact="''"/>`);
      w.object(
        shape.fields,
        (key, type) => {
          const expr = type.from === undefined ? `$In.$${key}` : `$In${type.from}`;
          return type.kind === "nullable" ? `@${expr}` : expr;
        },
        "",
      );
      w.line(`<return value="$Json"/>`);
    },
    "$Json",
  );

const eventEmitter = (type: EventType) => {
  const def = events[type];
  const params: Param[] = [
    ...(def.hunt ? [{ name: "hunt" }] : []),
    ...Object.entries(def.data).map(([name, type]) => ({ name, nullable: type.kind === "nullable" })),
  ];
  return library(
    eventLibrary(type),
    `Writes a ${type} log event. Params: ${params.map((param) => param.name).join(", ")}`,
    params,
    (w) => {
      const envelope = `{"v":${VERSION},"type":"${type}","t":`;
      w.line(`<set_value name="$Line" exact="${attr(`${lit(envelope)} + '%s'.[(player.age)f]`)}"/>`);
      if (def.hunt) w.value(id(), "$hunt", ',"hunt":', 1);
      w.object(def.data, (key) => `$${key}`, ',"data":', "}");
      w.line(`<debug_text text="${attr(`${lit(MARKER)} + $Line`)}" context="false" filter="general"/>`);
    },
    "$Line",
  );
};

export function generateLibrary(): string {
  const types = Object.keys(events) as EventType[];
  for (const type of types) checkNames(events[type].data, type);
  const shapes = [...shapesOf(types.flatMap((type) => Object.values(events[type].data))).values()];
  for (const shape of shapes) checkNames(shape.fields, shape.name);

  return [
    '<?xml version="1.0" encoding="utf-8"?>',
    "<!-- Generated by tools/log/generate.ts from tools/log/schema.ts. Don't edit it: change the schema",
    "     and run make log-xml. MD writes log events only through these libraries (ADR 0001), e.g.",
    `       <run_actions ref="${ref(eventLibrary("hunt.kill"))}">`,
    '         <param name="hunt" value="$HuntKey"/>',
    '         <param name="victim" value="$Ship"/>',
    "         ...",
    "       </run_actions> -->",
    `<mdscript name="${SCRIPT}" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="md.xsd">`,
    "  <cues>",
    ...nameHelper(),
    ...shapes.flatMap(shapeHelper),
    ...types.flatMap(eventEmitter),
    "  </cues>",
    "</mdscript>",
    "",
  ].join("\n");
}
