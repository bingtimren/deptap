
/**
 * A component is an object that has a "depends" property, which is an object mapping dependency names to their values
 */ 
export type Component<DependencyManifest extends object> = {
    depends : DependencyManifest
};


/**
 * Consistent dependency manifest makes sure that the dependency manifest of each member component is consistent with (partial of) the overall dependency manifest
 */
export type ConsistentDependencyManifest<DependencyManifest extends object> = {
    [k in keyof DependencyManifest]: DependencyManifest[k] extends {depends : object} ? Component<Partial<DependencyManifest>> : DependencyManifest[k];
}

/**
 * A container is a function that takes a key and returns the corresponding component or value from the manifest, after resolving its dependencies
 */
export type ContainerType<DependencyManifest> = <K extends keyof DependencyManifest>(k: K) => DependencyManifest[K];

/**
 * A factory that can accepts a consistent dependency manifest, and returns a container that can resolve dependencies
 * @param componentRegistry 
 * @returns 
 */
export function containerFactory<DependencyManifest extends object>(componentRegistry : ConsistentDependencyManifest<DependencyManifest>) : ContainerType<DependencyManifest> {
    const componentDependencyHasBeenSupplied : {[k in keyof DependencyManifest]?: true} = {};
    function isComponent(something : unknown) : something is Component<DependencyManifest> {
        try {
            // assume something is a component, then it has a "depends" property, which is an object, 
            // and all its keys are in the component registry
            const somethingAssumedToBeComponent = something as Component<DependencyManifest>;
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