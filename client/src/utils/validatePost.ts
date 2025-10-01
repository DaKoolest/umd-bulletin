export const TITLE_MAX = 25;
export const BODY_MAX = 100;

export function validateTitle(title: string): string | undefined {
    if (!title) return "Title is required";
    if (title.length > TITLE_MAX)
        return `Title must be at most ${TITLE_MAX} characters`;
    return undefined;
}

export function validateBody(body: string): string | undefined {
    if (!body) return "Body is required";
    if (body.length > BODY_MAX)
        return `Body must be at most ${BODY_MAX} characters`;
    return undefined;
}
