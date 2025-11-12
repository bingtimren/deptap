import { containerFactory, UninitializedComponent, Component, ContainerContextType} from '#deptap';

// A component depends on B component
type AComponent = Component<{bComponent: BComponent}> & {name: string};
// B component depends on C value
type BComponent = Component<{cValue: number}> & {name: string};

const aComponent : UninitializedComponent<AComponent> = {
    name: "aComponent",
    depends: {
        bComponent: undefined
    }
};

const bComponent : UninitializedComponent<BComponent> = {
    name: "bComponent",
    depends: {
        cValue: undefined
    }
};

// ContainerContextType ensures that the context is well-typed
const context: ContainerContextType<{
    aComponent: AComponent;
    bComponent: BComponent;
    cValue: number;
}> = {
    aComponent, bComponent, cValue : 42
};

const container = containerFactory(context);

test('container can supply components with property supplied dependencies', () => {
    const aComponentFromContainer = container('aComponent');
    expect(aComponentFromContainer).toBe(aComponent);
    expect(aComponentFromContainer.depends.bComponent).toBe(bComponent);
    expect(aComponentFromContainer.depends.bComponent.depends.cValue).toBe(42);
});

