make sure the DB:

- has PGVector installed in public schema
- has search path set to 

SET search_path TO public, linkbase; // any other schema that needs to be able to use vector data type
