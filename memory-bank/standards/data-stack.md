# Data Stack

## Overview
A lightweight data persistence layer using SQLite for storage and Prisma as the type-safe ORM, optimized for simplicity and rapid development.

## Database
SQLite

File-based database with zero infrastructure overhead. Ideal for getting started quickly without managing a database server. Can be migrated to PostgreSQL later if scaling demands it.

## ORM / Database Client
Prisma

Schema-first ORM with auto-generated TypeScript types, declarative migrations, and an intuitive query API. Integrates seamlessly with Next.js and provides excellent developer experience for data modeling and access.

## Decision Relationships
- SQLite pairs well with Prisma, which has first-class SQLite support.
- Prisma's schema-first approach means migrating from SQLite to PostgreSQL later requires minimal code changes — just swap the datasource provider.
- Type-safe queries align with the TypeScript-first philosophy from the tech stack.
