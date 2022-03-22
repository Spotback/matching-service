const substitutor = (() => {
    const regEx = /{([^{]*?)}/g;

    const checkForSubstitutors = (str: string): boolean => {
        return regEx.test(str);
    }

    const getSubstitueValue = (context: any): any => {
        return (regexMatch: any, placeholder: any) => {
            const splitArray: string[] = placeholder.split(".")
            let currentContext = context;
            while (splitArray.length) {
                const item: any = splitArray.shift();
                if (typeof (currentContext) === "object" && item in currentContext)
                    currentContext = currentContext[item];
                else
                    return;
            }
            return currentContext;
        };
    };
    return (input: string, context: string): string => {
        while (checkForSubstitutors(input)) {
            input = input.replace(regEx, getSubstitueValue(context));
        }
        return input
    };
})();

export default substitutor;