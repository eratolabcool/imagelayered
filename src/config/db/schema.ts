// this file is used to export the schema for the database
export * from './schema.sqlite'; // sqlite schema, used when DATABASE_PROVIDER=sqlite or DATABASE_PROVIDER=turso
export * from './schema.studio.sqlite'; // Layer Studio P0 persistence tables
export * from './schema.mini.sqlite'; // WeChat Mini Program identity + session
// export * from './schema.mysql'; // mysql schema, used when DATABASE_PROVIDER=mysql
// export * from './schema.postgres'; // postgres schema, used when DATABASE_PROVIDER=postgresql
