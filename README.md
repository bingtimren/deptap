# deptap

A minimalist, strong-typed, yet-another IoC (Inversion of Control) library for Typescript / Javascript

- Minimalist: zero dependency, the library only contains 100+ lines of code, about half of which are comments
- Strong typed: the code maintains strong typing to catch type inconsistencies, if using Typescript
- No risk of lock-in: a Component is just a plain object with a "depends" property, it does not even need to know this library

At the core, it only does two things:
- recursively initializes components following their dependency graph
- maintains strong typing in its interface for Typescript checking

For usage, see [happy-path.test.ts](test/happy-path.test.ts)
