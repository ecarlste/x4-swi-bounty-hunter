import sys,re
from collections import deque
path=sys.argv[1]
stack=[]  # (class, macro, line)
own={}  # connection id -> sector macro
links=[]  # (connid, connectedid)
gatemacro={}
pending=None
tagre=re.compile(r'<component\b[^>]*?/?>|</component>|<connection\b[^>]*?>|<connected connection="(\[0x[0-9a-f]+\])"')
with open(path,encoding='utf-8',errors='replace') as f:
  for n,line in enumerate(f,1):
    if '<savegame' in line: pass
    if n>23000000: break
    for m in tagre.finditer(line):
      t=m.group(0)
      if t.startswith('</component'):
        if stack: stack.pop()
      elif t.startswith('<component'):
        if t.endswith('/>'): continue
        c=re.search(r'class="([^"]*)"',t); mc=re.search(r'macro="([^"]*)"',t)
        stack.append((c.group(1) if c else '', mc.group(1) if mc else ''))
      elif t.startswith('<connection'):
        i=re.search(r'id="(\[0x[0-9a-f]+\])"',t)
        if stack and stack[-1][0] in ('gate','highwayentrygate') and i:
          sec=[s[1] for s in stack if s[0]=='sector']
          if sec: own[i.group(1)]=sec[-1]; pending=i.group(1)
        else: pending=None
      else:
        if pending: links.append((pending,m.group(1))); pending=None
g={}
for a,b in links:
  if a in own and b in own and own[a]!=own[b]:
    g.setdefault(own[a],set()).add(own[b]); g.setdefault(own[b],set()).add(own[a])
src,dst=sys.argv[2],sys.argv[3]
prev={src:None};q=deque([src])
while q:
  u=q.popleft()
  for v in g.get(u,()):
    if v not in prev: prev[v]=u;q.append(v)
print('nodes',len(g))
if dst in prev:
  p=[];x=dst
  while x: p.append(x);x=prev[x]
  print(' -> '.join(reversed(p)))
else: print('no path')
for s in (src,dst): print(s,sorted(g.get(s,())))
