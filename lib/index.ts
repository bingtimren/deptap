// component type is something may be managed by a containter
// it depends on some dependencies to be supplied by the container before it can be used
// and it might be supplied to some other components as a dependency

export type NonComponentType = unknown;

export type ComponentType<ComponentManifestType> = {
    depends : {[k in keyof Partial<ComponentManifestType>] : unknown}
};

// a component registry type, is a map from some string key to a component type
// each component type may has some dependencies to be supplied by the container
export type ComponentRegistryType = {[k : string] : ComponentType<ComponentRegistryType> | NonComponentType};

// a container that can produce the fully injected instance of any registered component by its key
export type ContainerType<Registry extends ComponentRegistryType> = ( k : keyof Registry) =>  Registry[typeof k];

// a factory that can produce a container given a component registry
export type ContainerFactoryType<Registry extends ComponentRegistryType> = (componentRegistry : Registry) => ContainerType<Registry>;

export function containerFactory<Registry extends ComponentRegistryType>(componentRegistry : Registry) : ContainerType<Registry> {
    const componentDependencyHasBeenSupplied : {[k in keyof Registry]?: true} = {};
    function isComponent(something : unknown) : something is ComponentType<Registry> {
        try {
            // assume something is a component, then it has a "depends" property, which is an object, 
            // and all its keys are in the component registry
            const somethingAssumedToBeComponent = something as ComponentType<Registry>;
            return Object.getOwnPropertyNames(somethingAssumedToBeComponent.depends).every(key => key in componentRegistry);
        } catch {
            // if anything goes wrong, it is not a component
            return false;
        }
    }
    const container : ContainerType<Registry> = ( k : keyof Registry) =>  {
        const kComponent = componentRegistry[k];
        if (componentDependencyHasBeenSupplied[k]) {
            return kComponent;
        } else {
            if (isComponent(kComponent)) {
                // must first supply all dependencies of kComponent
                for (const eachDependencyKey of Object.getOwnPropertyNames(kComponent.depends) as (keyof Registry)[]) {
                    // recursively calls the factory to get each of its dependencies and supply to the component
                    const dependencyOfKComponentForTheDependencyKey = container(eachDependencyKey);
                    kComponent.depends[eachDependencyKey] = dependencyOfKComponentForTheDependencyKey;
                }
            } else {
                // kComponent is not a component, nothing to do
            }
            componentDependencyHasBeenSupplied[k] = true;
            return kComponent;
        }
    };
    return container;
}