export type GameValue = boolean | string | null;

const IDENT_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/;

type TokenType =
    | "ident"
    | "string"
    | "true"
    | "false"
    | "null"
    | "and"
    | "or"
    | "not"
    | "eq"
    | "ne"
    | "assign"
    | "lparen"
    | "rparen"
    | "semi"
    | "eof";

type Token = { type: TokenType; value?: string };

class Tokenizer {
    private index = 0;

    constructor(private readonly source: string) {}

    public next(): Token {
        this.skipWhitespace();
        if (this.index >= this.source.length) {
            return { type: "eof" };
        }

        const char = this.source[this.index];
        if (char === "(") {
            this.index += 1;
            return { type: "lparen" };
        }
        if (char === ")") {
            this.index += 1;
            return { type: "rparen" };
        }
        if (char === ";") {
            this.index += 1;
            return { type: "semi" };
        }
        if (char === "!" && this.source[this.index + 1] === "=") {
            this.index += 2;
            return { type: "ne" };
        }
        if (char === "!") {
            this.index += 1;
            return { type: "not" };
        }
        if (char === "=" && this.source[this.index + 1] === "=") {
            this.index += 2;
            return { type: "eq" };
        }
        if (char === "=") {
            this.index += 1;
            return { type: "assign" };
        }
        if (char === "&" && this.source[this.index + 1] === "&") {
            this.index += 2;
            return { type: "and" };
        }
        if (char === "|" && this.source[this.index + 1] === "|") {
            this.index += 2;
            return { type: "or" };
        }
        if (char === "\"") {
            return this.readString();
        }
        if (/[A-Za-z_]/.test(char)) {
            return this.readIdent();
        }

        throw new Error(`Unexpected character '${char}' in '${this.source}'`);
    }

    private skipWhitespace(): void {
        while (this.index < this.source.length && /\s/.test(this.source[this.index])) {
            this.index += 1;
        }
    }

    private readString(): Token {
        const start = this.index;
        this.index += 1;
        let value = "";
        while (this.index < this.source.length) {
            const char = this.source[this.index];
            if (char === "\"") {
                this.index += 1;
                return { type: "string", value };
            }
            if (char === "\\" || char === "\n" || char === "\r") {
                throw new Error(`Unsupported string literal in '${this.source}'`);
            }
            value += char;
            this.index += 1;
        }
        throw new Error(`Unterminated string literal starting at '${this.source.slice(start)}'`);
    }

    private readIdent(): Token {
        const start = this.index;
        this.index += 1;
        while (this.index < this.source.length && /[A-Za-z0-9_]/.test(this.source[this.index])) {
            this.index += 1;
        }
        const value = this.source.slice(start, this.index);
        if (value === "true") return { type: "true" };
        if (value === "false") return { type: "false" };
        if (value === "null") return { type: "null" };
        return { type: "ident", value };
    }
}

class ExpressionParser {
    private token: Token;

    constructor(
        private readonly source: string,
        private readonly state: GameState,
        private readonly dryRun: boolean = false
    ) {
        this.tokenizer = new Tokenizer(source);
        this.token = this.tokenizer.next();
    }

    private readonly tokenizer: Tokenizer;

    public parseExpression(): GameValue {
        return this.parseOr();
    }

    public parseAssignments(): void {
        while (this.token.type !== "eof") {
            if (this.token.type === "semi") {
                this.advance("semi");
                continue;
            }
            if (this.token.type !== "ident" || !this.token.value) {
                throw new Error(`Expected state name in '${this.source}'`);
            }
            const name = this.token.value;
            this.advance("ident");
            this.advance("assign");
            const value = this.parseLiteral();
            if (!this.dryRun) {
                this.state.set(name, value);
            } else {
                this.state.require(name);
            }
            if (this.currentType() === "semi") {
                this.advance("semi");
            }
        }
    }

    public expectEnd(): void {
        if (this.token.type !== "eof") {
            throw new Error(`Unexpected token '${this.token.type}' in '${this.source}'`);
        }
    }

    private parseOr(): GameValue {
        let value = this.parseAnd();
        while (this.token.type === "or") {
            this.advance("or");
            const right = this.parseAnd();
            value = toBoolean(value) || toBoolean(right);
        }
        return value;
    }

    private parseAnd(): GameValue {
        let value = this.parseUnary();
        while (this.token.type === "and") {
            this.advance("and");
            const right = this.parseUnary();
            value = toBoolean(value) && toBoolean(right);
        }
        return value;
    }

    private parseUnary(): GameValue {
        if (this.token.type === "not") {
            this.advance("not");
            return !toBoolean(this.parseUnary());
        }
        return this.parsePrimary();
    }

    private parsePrimary(): GameValue {
        if (this.token.type === "lparen") {
            this.advance("lparen");
            const value = this.parseExpression();
            this.advance("rparen");
            return value;
        }
        return this.parseComparison();
    }

    private parseComparison(): GameValue {
        const left = this.parseValue();
        if (this.token.type === "eq" || this.token.type === "ne") {
            const operator = this.token.type;
            this.advance(operator);
            const right = this.parseValue();
            return operator === "eq" ? left === right : left !== right;
        }
        return left;
    }

    private parseValue(): GameValue {
        if (this.token.type === "ident" && this.token.value) {
            const name = this.token.value;
            this.advance("ident");
            return this.state.get(name);
        }
        return this.parseLiteral();
    }

    private parseLiteral(): GameValue {
        if (this.token.type === "true") {
            this.advance("true");
            return true;
        }
        if (this.token.type === "false") {
            this.advance("false");
            return false;
        }
        if (this.token.type === "null") {
            this.advance("null");
            return null;
        }
        if (this.token.type === "string" && this.token.value !== undefined) {
            const value = this.token.value;
            this.advance("string");
            return value;
        }
        throw new Error(`Expected a value in '${this.source}'`);
    }

    private currentType(): TokenType {
        return this.token.type;
    }

    private advance(expected: TokenType): void {
        if (this.token.type !== expected) {
            throw new Error(`Expected '${expected}' in '${this.source}'`);
        }
        this.token = this.tokenizer.next();
    }
}

export class GameState {
    private readonly values = new Map<string, GameValue>();

    public init(name: string, raw: unknown): void {
        if (!IDENT_PATTERN.test(name)) {
            throw new Error(`Invalid state name: ${name}`);
        }
        this.values.set(name, parseInitValue(raw));
    }

    public require(name: string): void {
        if (!this.values.has(name)) {
            throw new Error(`Unknown state: ${name}`);
        }
    }

    public get(name: string): GameValue {
        this.require(name);
        return this.values.get(name);
    }

    public set(name: string, value: GameValue): void {
        this.require(name);
        this.values.set(name, value);
    }

    public evaluate(expression: string): boolean {
        if (!expression) {
            return true;
        }
        const parser = new ExpressionParser(expression, this);
        const result = parser.parseExpression();
        parser.expectEnd();
        return toBoolean(result);
    }

    public apply(consequence: string): void {
        if (!consequence) {
            return;
        }
        const parser = new ExpressionParser(consequence, this);
        parser.parseAssignments();
    }

    public validateExpression(expression: string): void {
        if (!expression) {
            return;
        }
        const parser = new ExpressionParser(expression, this);
        parser.parseExpression();
        parser.expectEnd();
    }

    public validateAssignments(consequence: string): void {
        if (!consequence) {
            return;
        }
        const parser = new ExpressionParser(consequence, this, true);
        parser.parseAssignments();
    }
}

function parseInitValue(raw: unknown): GameValue {
    if (typeof raw === "boolean") {
        return raw;
    }
    if (raw === null) {
        return null;
    }
    if (typeof raw !== "string") {
        throw new Error(`Unsupported state init: ${String(raw)}`);
    }

    const trimmed = raw.trim();
    if (trimmed === "null") {
        return null;
    }
    if (trimmed === "true") {
        return true;
    }
    if (trimmed === "false") {
        return false;
    }
    if (trimmed.startsWith("\"") && trimmed.endsWith("\"")) {
        const inner = trimmed.slice(1, -1);
        if (/["\\\n\r]/.test(inner)) {
            throw new Error(`Unsupported string init: ${raw}`);
        }
        return inner;
    }
    throw new Error(`Unsupported state init: ${raw}`);
}

function toBoolean(value: GameValue): boolean {
    return Boolean(value);
}
