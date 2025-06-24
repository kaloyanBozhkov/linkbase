/**
 * Connection database queries - pure data operations without HTTP handling.
 *
 * These functions handle only database operations and return data.
 * HTTP response handling is done in the router layer.
 */

export { createConnectionQuery } from "./create";
export { getAllConnectionsQuery } from "./getAll";
export { getConnectionByIdQuery } from "./getById";
export { updateConnectionQuery } from "./update";
export { deleteConnectionQuery } from "./delete";
export { searchConnectionsQuery } from "./search";
