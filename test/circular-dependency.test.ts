import { containerFactory, UninitializedComponent, Component, ContainerContextType} from '#deptap';

// A component depends on B component
type AComponent = Component<{bComponent: BComponent}> & {name: string};
// B component depends on C value
type BComponent = Component<{aComponent: AComponent, cValue: number}> & {name: string};
// X component depends on C value
type XComponent = Component<{cValue: number}> & {name: string};

const aComponent : UninitializedComponent<AComponent> = {
    name: "aComponent",
    depends: {
        bComponent: undefined
    }
};

const bComponent : UninitializedComponent<BComponent> = {
    name: "bComponent",
    depends: {
        aComponent: undefined,
        cValue: undefined
    }
};

const xComponent : UninitializedComponent<XComponent> = {
    name: "xComponent",
    depends: {
        cValue: undefined
    }
};


// ContainerContextType ensures that the context is well-typed
const context: ContainerContextType<{
    aComponent: AComponent;
    bComponent: BComponent;
    xComponent: XComponent;
    cValue: number;
}> = {
    aComponent, bComponent, xComponent, cValue : 42
};

test('eager-initialized container factory detects circular dependency', () => {
    expect(() => {
        containerFactory(context);
    }).toThrow(/Circular dependency detected/);
});

test('lazy-initialized container factory detects circular dependency', () => {
    const factory = containerFactory(context, true);
    expect(() => {
        factory('aComponent');
    }).toThrow(/Circular dependency detected/);
    expect(() => {
        factory('bComponent');
    }).toThrow(/Circular dependency detected/);
});

test('lazy-initialized container factory functions, if circular-dependeny path not touched', () => {
    const factory = containerFactory(context, true);
    expect(factory("xComponent").depends.cValue).toBe(42);
});
