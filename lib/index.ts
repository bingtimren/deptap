
// A component is an object that has a "depends" property, which is an object mapping dependency names to their types
export type Depends<DependencyManifest> = {
    depends : DependencyManifest
};

export type ContainerType<DependencyManifest> = <K extends keyof DependencyManifest>(k: K) => DependencyManifest[K];

// a factory that can produce a container given a component registry
export function containerFactory<DependencyManifest>(componentRegistry : DependencyManifest) : ContainerType<DependencyManifest> {
    const componentDependencyHasBeenSupplied : {[k in keyof DependencyManifest]?: true} = {};
    function isComponent(something : unknown) : something is Depends<DependencyManifest> {
        try {
            // assume something is a component, then it has a "depends" property, which is an object, 
            // and all its keys are in the component registry
            const somethingAssumedToBeComponent = something as Depends<DependencyManifest>;
            return Object.getOwnPropertyNames(somethingAssumedToBeComponent.depends).every(key => key in (componentRegistry as object));
        } catch {
            // if anything goes wrong, it is not a component
            return false;
        }
    }
    const circularDependencyAwareContainer : <K extends keyof DependencyManifest>( k : K, componentDependencyChain: (keyof DependencyManifest)[]) =>  DependencyManifest[K] = ( k, componentDependencyChain) =>  {
        const kComponent = componentRegistry[k];
        if (componentDependencyHasBeenSupplied[k]) {
            return kComponent as any;
        } else {
            if (isComponent(kComponent)) {
                if (componentDependencyChain.includes(k)) {
                    throw new Error(`Circular dependency detected: ${[...componentDependencyChain, k].join(' -> ')}`);
                }
                // must first supply all dependencies of kComponent
                const componentDependencyChainWithK = [...componentDependencyChain, k];
                for (const eachDependencyKey of Object.getOwnPropertyNames(kComponent.depends) as (keyof DependencyManifest)[]) {
                    // recursively calls the factory to get each of its dependencies and supply to the component
                    const dependencyOfKComponentForTheDependencyKey = circularDependencyAwareContainer(eachDependencyKey, componentDependencyChainWithK);
                    kComponent.depends[eachDependencyKey] = dependencyOfKComponentForTheDependencyKey;
                }
            } else {
                // kComponent is not a component, nothing to do
            }
            componentDependencyHasBeenSupplied[k] = true;
            return kComponent;
        }
    };
    return (k) => circularDependencyAwareContainer(k, []);
}