import sys,re
path=sys.argv[1]; targets=set(int(x) for x in sys.argv[2:])
stack=[]
op=re.compile(r'<component\b([^>]*?)(/?)>'); cl=re.compile(r'</component>')
with open(path,encoding='utf-8',errors='replace') as f:
  for n,line in enumerate(f,1):
    if n>max(targets): break
    for m in re.finditer(r'<component\b[^>]*?/?>|</component>',line):
      t=m.group(0)
      if t.startswith('</'): stack.pop() if stack else None
      elif not t.endswith('/>'):
        stack.append((n,t[:250]))
    if n in targets:
      print('== line',n)
      for s in stack: print(s[0],s[1])
