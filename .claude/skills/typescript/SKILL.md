---
name: typescript
description: TypeScript engineering guidelines based on Google's style guide. Use when writing, reviewing, or refactoring TypeScript code in this project.
---

Comprehensive guidelines for writing production-quality TypeScript based on Google's TypeScript Style Guide.
Naming Conventions
Type 	Convention 	Example
Classes, Interfaces, Types, Enums 	UpperCamelCase 	UserService, HttpClient
Variables, Parameters, Functions 	lowerCamelCase 	userName, processData
Global Constants, Enum Values 	CONSTANT_CASE 	MAX_RETRIES, Status.ACTIVE
Type Parameters 	Single letter or UpperCamelCase 	T, ResponseType
Naming Principles

    Descriptive names, avoid ambiguous abbreviations
    Treat acronyms as words: loadHttpUrl not loadHTTPURL
    No prefixes like opt_ for optional parameters
    No trailing underscores for private properties
    Single-letter variables only when scope is <10 lines

Variable Declarations

// Always use const by default
const users = getUsers();

// Use let only when reassignment is needed
let count = 0;
count++;

// Never use var
// var x = 1;  // WRONG

// One variable per declaration
const a = 1;
const b = 2;
// const a = 1, b = 2;  // WRONG

Types and Interfaces
Prefer Type Aliases Over Interfaces

// Good: type alias for object shapes
type User = {
  id: string;
  name: string;
  email?: string;
};

// Avoid: interface for object shapes
// interface User {
//   id: string;
//   name: string;
// }

// Type aliases work for everything: objects, unions, intersections, mapped types
type Status = 'active' | 'inactive';
type Combined = TypeA & TypeB;
type Handler = (event: Event) => void;

// Benefits of types over interfaces:
// 1. Consistent syntax for all type definitions
// 2. Cannot be merged/extended unexpectedly (no declaration merging)
// 3. Better for union types and computed properties
// 4. Works with utility types more naturally

Type Inference

Leverage inference for trivially inferred types:

// Good: inference is clear
const name = 'Alice';
const items = [1, 2, 3];

// Good: explicit for complex expressions
const result: ProcessedData = complexTransformation(input);

Array Types

// Simple types: use T[]
const numbers: number[];
const names: readonly string[];

// Multi-dimensional: use T[][]
const matrix: number[][];

// Complex types: use Array<T>
const handlers: Array<(event: Event) => void>;

Null and Undefined

// Prefer optional fields over union with undefined
interface Config {
  timeout?: number;        // Good
  // timeout: number | undefined;  // Avoid
}

// Type aliases must NOT include |null or |undefined
type UserId = string;  // Good
// type UserId = string | null;  // WRONG

// May use == for null comparison (catches both null and undefined)
if (value == null) {
  // handles both null and undefined
}

Types to Avoid

// Avoid any - use unknown instead
function parse(input: unknown): Data { }

// Avoid {} - use unknown, Record<string, T>, or object
function process(obj: Record<string, unknown>): void { }

// Use lowercase primitives
let name: string;    // Good
// let name: String;  // WRONG

// Never use wrapper objects
// new String('hello')  // WRONG

Classes
Structure

class UserService {
  // Fields first, initialized where declared
  private readonly cache = new Map<string, User>();
  private lastAccess: Date | null = null;

  // Constructor with parameter properties
  constructor(
    private readonly api: ApiClient,
    private readonly logger: Logger,
  ) {}

  // Methods separated by blank lines
  async getUser(id: string): Promise<User> {
    // ...
  }

  private validateId(id: string): boolean {
    // ...
  }
}

Visibility

class Example {
  // private by default, only use public when needed externally
  private internalState = 0;

  // readonly for properties never reassigned after construction
  readonly id: string;

  // Never use #private syntax - use TypeScript visibility
  // #field = 1;  // WRONG
  private field = 1;  // Good
}

Avoid Arrow Functions as Properties

class Handler {
  // Avoid: arrow function as property
  // handleClick = () => { ... };

  // Good: instance method
  handleClick(): void {
    // ...
  }
}

// Bind at call site if needed
element.addEventListener('click', () => handler.handleClick());

Static Methods

    Never use this in static methods
    Call on defining class, not subclasses

Functions
Prefer Function Declarations

// Good: function declaration for named functions
function processData(input: Data): Result {
  return transform(input);
}

// Arrow functions when type annotation needed
const handler: EventHandler = (event) => {
  // ...
};

Arrow Function Bodies

// Concise body only when return value is used
const double = (x: number) => x * 2;

// Block body when return should be void
const log = (msg: string) => {
  console.log(msg);
};

Parameters

// Use rest parameters, not arguments
function sum(...numbers: number[]): number {
  return numbers.reduce((a, b) => a + b, 0);
}

// Destructuring for multiple optional params
interface Options {
  timeout?: number;
  retries?: number;
}
function fetch(url: string, { timeout = 5000, retries = 3 }: Options = {}) {
  // ...
}

// Never name a parameter 'arguments'

Imports and Exports
Always Use Named Exports

// Good: named exports
export function processData() { }
export class UserService { }
export interface Config { }

// Never use default exports
// export default class UserService { }  // WRONG

Import Styles

// Module import for large APIs
import * as fs from 'fs';

// Named imports for frequently used symbols
import { readFile, writeFile } from 'fs/promises';

// Type-only imports when only used as types
import type { User, Config } from './types';

Module Organization

    Use modules, never namespace Foo { }
    Never use require() - use ES6 imports
    Use relative imports within same project
    Avoid excessive ../../../

Control Structures
Always Use Braces

// Good
if (condition) {
  doSomething();
}

// Exception: single-line if
if (condition) return early;

Loops

// Prefer for...of for arrays
for (const item of items) {
  process(item);
}

// Use Object methods with for...of for objects
for (const [key, value] of Object.entries(obj)) {
  // ...
}

// Never use unfiltered for...in on arrays

Equality

// Always use === and !==
if (a === b) { }

// Exception: == null catches both null and undefined
if (value == null) { }

Switch Statements

switch (status) {
  case Status.Active:
    handleActive();
    break;
  case Status.Inactive:
    handleInactive();
    break;
  default:
    // Always include default, even if empty
    break;
}

Exception Handling

// Always throw Error instances
throw new Error('Something went wrong');
// throw 'error';  // WRONG

// Catch with unknown type
try {
  riskyOperation();
} catch (e: unknown) {
  if (e instanceof Error) {
    logger.error(e.message);
  }
  throw e;
}

// Empty catch needs justification comment
try {
  optional();
} catch {
  // Intentionally ignored: fallback behavior handles this
}

Type Assertions

// Use 'as' syntax, not angle brackets
const input = value as string;
// const input = <string>value;  // WRONG in TSX, avoid everywhere

// Double assertion through unknown when needed
const config = (rawData as unknown) as Config;

// Add comment explaining why assertion is safe
const element = document.getElementById('app') as HTMLElement;
// Safe: element exists in index.html

Strings

// Use single quotes for string literals
const name = 'Alice';

// Template literals for interpolation or multiline
const message = `Hello, ${name}!`;
const query = `
  SELECT *
  FROM users
  WHERE id = ?
`;

// Never use backslash line continuations

Disallowed Features
Feature 	Alternative
var 	const or let
Array() constructor 	[] literal
Object() constructor 	{} literal
any type 	unknown
namespace 	modules
require() 	import
Default exports 	Named exports
#private fields 	private modifier
eval() 	Never use
const enum 	Regular enum
debugger 	Remove before commit
with 	Never use
Prototype modification 	Never modify
