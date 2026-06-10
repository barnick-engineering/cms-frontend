type EvalContext = {
  inputs: Record<string, string | number | boolean>
  steps: Record<string, number>
  rates: Record<string, number>
}

function resolveIdentifier(path: string, ctx: EvalContext): number | boolean | string {
  const parts = path.split('.')
  if (parts.length < 2) return 0

  const [scope, key] = parts
  if (scope === 'inputs') {
    const v = ctx.inputs[key]
    if (typeof v === 'boolean') return v
    if (typeof v === 'number') return v
    if (typeof v === 'string') {
      const n = Number(v)
      return Number.isFinite(n) ? n : v
    }
    return 0
  }
  if (scope === 'steps') return ctx.steps[key] ?? 0
  if (scope === 'rates') return ctx.rates[key] ?? 0
  return 0
}

function toNumber(v: unknown): number {
  if (typeof v === 'boolean') return v ? 1 : 0
  if (typeof v === 'number') return v
  if (typeof v === 'string') {
    const n = Number(v)
    return Number.isFinite(n) ? n : 0
  }
  return 0
}

/** Safe expression evaluator for costing formulas (no eval). */
export function evaluateExpression(expr: string, ctx: EvalContext): number {
  const trimmed = expr.trim()
  if (!trimmed) return 0

  // if(cond, a, b)
  const ifMatch = trimmed.match(/^if\s*\((.+)\)$/i)
  if (ifMatch) {
    const inner = ifMatch[1]
    const commaParts = splitTopLevel(inner, ',')
    if (commaParts.length === 3) {
      const cond = evaluateExpression(commaParts[0], ctx)
      return cond ? evaluateExpression(commaParts[1], ctx) : evaluateExpression(commaParts[2], ctx)
    }
  }

  // ceil(x), floor(x), max(a,b), min(a,b)
  const fnMatch = trimmed.match(/^(ceil|floor|max|min)\s*\((.+)\)$/i)
  if (fnMatch) {
    const fn = fnMatch[1].toLowerCase()
    const args = splitTopLevel(fnMatch[2], ',').map((a) => evaluateExpression(a, ctx))
    switch (fn) {
      case 'ceil':
        return Math.ceil(args[0] ?? 0)
      case 'floor':
        return Math.floor(args[0] ?? 0)
      case 'max':
        return Math.max(args[0] ?? 0, args[1] ?? 0)
      case 'min':
        return Math.min(args[0] ?? 0, args[1] ?? 0)
      default:
        return 0
    }
  }

  // identifier path
  if (/^(inputs|steps|rates)\.\w+$/.test(trimmed)) {
  const v = resolveIdentifier(trimmed, ctx)
    return toNumber(v)
  }

  // arithmetic with + - * /
  return evaluateArithmetic(trimmed, ctx)
}

function splitTopLevel(s: string, sep: string): string[] {
  const parts: string[] = []
  let depth = 0
  let current = ''
  for (let i = 0; i < s.length; i++) {
    const c = s[i]
    if (c === '(') depth++
    if (c === ')') depth--
    if (c === sep && depth === 0) {
      parts.push(current.trim())
      current = ''
    } else {
      current += c
    }
  }
  if (current.trim()) parts.push(current.trim())
  return parts
}

function evaluateArithmetic(expr: string, ctx: EvalContext): number {
  const tokens = tokenize(expr)
  if (tokens.length === 0) return 0

  // parse + and - at top level
  let pos = 0

  function parseExpr(): number {
    let val = parseTerm()
    while (pos < tokens.length && (tokens[pos] === '+' || tokens[pos] === '-')) {
      const op = tokens[pos++]
      const right = parseTerm()
      val = op === '+' ? val + right : val - right
    }
    return val
  }

  function parseTerm(): number {
    let val = parseFactor()
    while (pos < tokens.length && (tokens[pos] === '*' || tokens[pos] === '/')) {
      const op = tokens[pos++]
      const right = parseFactor()
      val = op === '*' ? val * right : val / right
    }
    return val
  }

  function parseFactor(): number {
    const t = tokens[pos]
    if (t === '(') {
      pos++
      const val = parseExpr()
      if (tokens[pos] === ')') pos++
      return val
    }
    if (t === '-' && tokens[pos + 1]) {
      pos++
      return -parseFactor()
    }
    if (/^(inputs|steps|rates)\.\w+$/.test(t)) {
      pos++
      return toNumber(resolveIdentifier(t, ctx))
    }
    if (/^-?\d+(\.\d+)?$/.test(t)) {
      pos++
      return Number(t)
    }
    pos++
    return 0
  }

  return parseExpr()
}

function tokenize(expr: string): string[] {
  const tokens: string[] = []
  let i = 0
  while (i < expr.length) {
    const c = expr[i]
    if (c === ' ' || c === '\t') {
      i++
      continue
    }
    if (['+', '-', '*', '/', '(', ')'].includes(c)) {
      tokens.push(c)
      i++
      continue
    }
    if (/[a-zA-Z_]/.test(c)) {
      let j = i
      while (j < expr.length && /[\w.]/.test(expr[j])) j++
      tokens.push(expr.slice(i, j))
      i = j
      continue
    }
    if (/[\d.]/.test(c)) {
      let j = i
      while (j < expr.length && /[\d.]/.test(expr[j])) j++
      tokens.push(expr.slice(i, j))
      i = j
      continue
    }
    i++
  }
  return tokens
}

export function evaluateCondition(expr: string, ctx: EvalContext): boolean {
  const trimmed = expr.trim()
  if (!trimmed) return true

  if (/^(inputs|steps|rates)\.\w+$/.test(trimmed)) {
    const v = resolveIdentifier(trimmed, ctx)
    if (typeof v === 'boolean') return v
    return toNumber(v) !== 0
  }

  return evaluateExpression(trimmed, ctx) !== 0
}
