import path from 'node:path';
export default { rules: { boundaries: {
  meta: { type: 'problem', schema: [], messages: { boundary: 'Dependência proibida entre camadas: {{source}}.' } },
  create(context) {
    const filename = context.filename.replaceAll('\\', '/');
    function check(node, value) {
      if (typeof value !== 'string') { if (filename.includes('/src/domain/')) context.report({ node, messageId: 'boundary', data: { source: 'import dinâmico não verificável' } }); return; }
      const resolved = (value.startsWith('@/') ? path.resolve('src', value.slice(2)) : value.startsWith('.') ? path.resolve(path.dirname(context.filename), value) : value).replaceAll('\\', '/');
      if (filename.includes('/src/domain/') && (!resolved.includes('/src/domain/') || /(^|\/)node_modules\//.test(resolved))) {
        context.report({ node, messageId: 'boundary', data: { source: value } });
      }
      const current = filename.match(/\/src\/features\/([^/]+)\//)?.[1];
      const target = resolved.match(/\/src\/features\/([^/]+)\//)?.[1];
      if (current && target && current !== target) context.report({ node, messageId: 'boundary', data: { source: value } });
    }
    return { ImportDeclaration: n => check(n, n.source.value), ExportNamedDeclaration: n => n.source && check(n, n.source.value), ExportAllDeclaration: n => check(n, n.source.value), ImportExpression: n => check(n, n.source.value), CallExpression: n => { if (n.callee.name === 'require') check(n, n.arguments[0]?.value); } };
  },
} } };
