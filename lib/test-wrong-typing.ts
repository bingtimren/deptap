import { containerFactory, Component } from '#deptap';

type RegistryType = {
    aComponent: AComponent;
    bComponent: BComponent;
    cValue: number;
}
type AComponent = Component<{bComponent: BComponent|undefined}> & {name: string};
type BComponent = Component<{cValue: number|undefined}> & {name: string};

const aComponent : AComponent = {
    name: "aComponent",
    depends: {
        bComponent: undefined
    }
};

const bComponent : BComponent = {
    name: "bComponent",
    depends: {
        cValue: undefined
    }
};

const container = containerFactory({
    aComponent, bComponent : "wrongly-typed-bComponent", cValue : 42
} as RegistryType);

export function test() {
    const aComponentFromContainer = container('aComponent');
    return (aComponentFromContainer === aComponent) &&
        (aComponentFromContainer.depends.bComponent === bComponent) &&
        (aComponentFromContainer.depends.bComponent!.depends.cValue === 42);
}

