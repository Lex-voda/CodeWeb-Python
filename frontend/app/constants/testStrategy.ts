export const testStrategy = {
    strategy1: {
        argus: [
            {
                argu_name: "a",
                argu_annotation: "string",
                argu_default: "abc"
            },
            {
                argu_name: "a",
                argu_annotation: "string",
                argu_default: "abc"
            },
            {
                argu_name: "b",
                argu_annotation: "number",
                argu_default: "1"
            }
        ],
        return_annotation: "number",
        comment: "nothing"
    },
    strategy2: {
        argus: [
            {
                argu_name: "a",
                argu_annotation: "string",
                argu_default: "abc"
            },
            {
                argu_name: "b",
                argu_annotation: "number",
                argu_default: "1"
            }
        ],
        return_annotation: "number",
        comment: "nothing"
    },
    strategy3: {
        argus: [
            {
                argu_name: "a",
                argu_annotation: "string",
                argu_default: "abc"
            },
            {
                argu_name: "b",
                argu_annotation: "number",
                argu_default: "1"
            },
            {
                argu_name: "b",
                argu_annotation: "number",
                argu_default: "1"
            }
        ],
        return_annotation: "number",
        comment: "nothing"
    },
}
