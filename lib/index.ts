export const add = (a: number, b: number): number => {
    return a + b;
};


// component type is something may be managed by a containter
// it depends on some dependencies to be supplied by the container before it can be used
// and it might be supplied to some other components as a dependency

type ComponentType<ComponentManifestType> = {
    depends : {[k in keyof Partial<ComponentManifestType>] : ComponentManifestType[k] | undefined}
};

// a component registry type, is a map from some string key to a component type
// each component type may has some dependencies to be supplied by the container
type ComponentRegistryType = {[k : string] : ComponentType<ComponentRegistryType>};

// a container that can produce the fully injected instance of any registered component by its key
type ContainerType<Registry extends ComponentRegistryType> = ( k : keyof Registry) =>  Registry[typeof k];

// a factory that can produce a container given a component registry
type ContainerFactoryType<Registry extends ComponentRegistryType> = (componentRegistry : Registry) => ContainerType<Registry>;

function containerFactory<Registry extends ComponentRegistryType>(componentRegistry : Registry) : ContainerType<Registry> {
    const componentDependencyHasBeenSupplied : {[k in keyof Registry]?: true} = {};
    const container : ContainerType<Registry> = ( k : keyof Registry) =>  {
        const kComponent = componentRegistry[k];
        if (componentDependencyHasBeenSupplied[k]) {
            return kComponent;
        } else {
            // must first supply all dependencies of kComponent
            for (const eachDependencyKey of Object.getOwnPropertyNames(kComponent.depends)) {
                // recursively calls the factory to get each of its dependencies and supply to the component
                const dependencyOfKComponentForTheDependencyKey = container(eachDependencyKey);
                kComponent.depends[eachDependencyKey] = dependencyOfKComponentForTheDependencyKey;
            }
            return kComponent;
        }
    };
    return container;
}