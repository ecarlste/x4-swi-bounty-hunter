# print ancestor open tags of target line T
{
  line=$0
  # handle self-closing and closing per line (save is one element per line mostly)
  if (match(line, /^<\/[a-z]+>/)) { sp--; }
  else if (match(line, /^<[a-z]+/)) {
    if (line !~ /\/>[ \t]*$/ ) { sp++; st[sp]=NR ": " substr(line,1,300); }
  }
  if (NR==T) { for(i=1;i<=sp;i++) if (st[i] ~ /<(component|connection|universe|savegame)/) print st[i]; exit }
}
