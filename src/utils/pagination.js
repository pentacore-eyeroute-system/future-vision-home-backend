const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

// Reads ?limit= and ?page= off a request query, clamping to a server maximum so
// a client cannot ask for the whole table in one call.
export function parsePagination(query = {}) {
    const requestedLimit = Number.parseInt(query.limit, 10);
    const requestedPage = Number.parseInt(query.page, 10);

    const limit = Number.isInteger(requestedLimit) && requestedLimit > 0
        ? Math.min(requestedLimit, MAX_LIMIT)
        : DEFAULT_LIMIT;

    const page = Number.isInteger(requestedPage) && requestedPage > 0
        ? requestedPage
        : 1;

    return { limit, page, offset: (page - 1) * limit };
};

export function buildPaginationMeta({ limit, page }, total) {
    return {
        page,
        limit,
        total,
        totalPages: limit > 0 ? Math.ceil(total / limit) : 0,
    };
};
