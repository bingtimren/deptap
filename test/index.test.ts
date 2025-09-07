import { containerFactory, Depends } from '#deptap';

type AComponent = Depends<{bComponent: BComponent|undefined}> & {name: string};
type BComponent = Depends<{cValue: number|undefined}> & {name: string};

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

test('container can supply components with property supplied dependencies', () => {
    const aComponentFromContainer = container('aComponent');
    expect(aComponentFromContainer).toBe(aComponent);
    expect(aComponentFromContainer.depends.bComponent).toBe(bComponent);
    expect(aComponentFromContainer.depends.bComponent!.depends.cValue).toBe(42);
});

