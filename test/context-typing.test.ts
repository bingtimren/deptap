import { containerFactory, UninitializedComponent, Component, ContainerContextType} from '#deptap';

// A component depends on B component
type AComponent = Component<{bComponent: BComponent, cValue: string}> & {name: string};
// B component depends on C value
type BComponent = Component<{cValue: number}> & {name: string};

const aComponent : UninitializedComponent<AComponent> = {
    name: "aComponent",
    depends: {
        bComponent: undefined,
        cValue: undefined
    }
};

const bComponent : UninitializedComponent<BComponent> = {
    name: "bComponent",
    depends: {
        cValue: undefined
    }
};

/*
// Uncomment the following code to see TypeScript type errors
// This demonstrates the type-checking of the dependency manifests and context

// bComponent has wrong typing
const aComponentWithWrongType : UninitializedComponent<AComponent> = {
    name: "aComponent",
    depends: {
        bComponent: "this is wrong type"
    }
};

// aComponent has wrong typing, its cValue dependency is inconsistent with BComponent's cValue dependency type (number vs string)
const context: ContainerContextType<{
    aComponent: AComponent;
    bComponent: BComponent;
    cValue: number;
}> = {
    aComponent, bComponent, cValue : 42
};


*/


test('JUST PASS', () => {

});

