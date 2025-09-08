import { containerFactory, Component} from '#deptap';

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
    aComponent, bComponent, cValue : 42
});

export function test() {
    const aComponentFromContainer = container('aComponent');
    const aComponentFromContainerIsAComponent = (aComponentFromContainer === aComponent);
    const aComponentFromContainerHasDependencyProvided = aComponentFromContainer.depends.bComponent === bComponent;
    const bComponentIsWiredIntoAComponent = aComponentFromContainer.depends.bComponent === bComponent;
    const cValueIsWiredIntoBComponent = aComponentFromContainer.depends.bComponent.depends.cValue === 42;
}

