
/**
 * Component
 * A "Component" is an object that has a "depends" property, which is an object that maps names to 
 * either other components or non-component values, according to its Dependency Manifest type
 * 
 * When initialized by a container, the "depends" property will have all its properties supplied
 * by the container
 */
export type Component<DependencyManifest extends object> = {depends : DependencyManifest};

/**
 * AllowUndefined<T> is a mapped type that adds undefined to the types of the properties of T
 */
export type AllowUndefined<T extends object> = {
    [K in keyof T]: T[K] | undefined
};

/**
 * An Uninitialized Component from Dependency Manifest is a Component from a Dependency Manifest, however
 * the dependencies are not yet supplied & thus allows undefined
 * 
 */ 
export type UninitializedComponentFromDependencyManifest<DependencyManifest extends object> = {
    depends : AllowUndefined<DependencyManifest>
};

/**
 * Uninitialized Component
 * An Uninitialized Component is a component whose dependencies are not yet supplied, thus allows undefined
 */
export type UninitializedComponent<C> = C extends Component<infer ManifestType> ? Omit<C, "depends"> & {
    depends : AllowUndefined<ManifestType>
} : never;

/**
 * Contaiiner Context Type
 * Container Context is a mapped object that maps names to either components or non-component values
 * And it makes sure that if a property is a component, its dependency manifest is consistent with (partial of) the Contaiiner Context Type
 * In this sense, the Contaiiner Context Type is an aggregation of all dependency manifests of all components in the context
 */
export type ContainerContextType<DependencyManifest extends object> = {
    [k in keyof DependencyManifest]: (
        DependencyManifest[k] extends {depends : object} // is it a component?
        ? UninitializedComponentFromDependencyManifest<Partial<DependencyManifest>> // if yes, its dependency manifest must be a partial of the overall dependency manifest
        : DependencyManifest[k] // if not, it is just the value type
    );
}

/**
 * A Container is a function that takes a key and returns the corresponding component (after resolving its dependencies) or non-component value from the manifest 
 */
export type ContainerType<DependencyManifest extends object> = 
    <K extends keyof DependencyManifest>(k: K) => DependencyManifest[K];

/**
 * A factory that can accepts an aggregated Dependency Manifest (Container Context), and returns a Container
 * 
 * @param context - components in the context will be resolved when required
 * @returns - a container function that can supply components or values with their dependencies resolved
 */
export function containerFactory<DependencyManifest extends object>(context : ContainerContextType<DependencyManifest>, lazy:boolean = false) : ContainerType<DependencyManifest> {
    // keep track of which component's dependencies have been resolved
    const componentDependencyHasBeenResolved : Set<keyof DependencyManifest> = new Set();
    // helper type guard to check if something is a component - a component must has a "depends" property whose keys are all in the component context
    function isComponent(something : unknown) : something is UninitializedComponentFromDependencyManifest<DependencyManifest> {
        try {
            // assume something is a component, then it has a "depends" property, which is an object, 
            // and all its keys are in the component context
            const somethingAssumedToBeComponent = something as UninitializedComponentFromDependencyManifest<DependencyManifest>;
            return Object.getOwnPropertyNames(somethingAssumedToBeComponent.depends).every(key => key in (context as object));
        } catch {
            // if anything goes wrong, it is not a component
            return false;
        }
    }
    // the actual container function that is circular-dependency-aware
    const circularDependencyAwareContainer = <K extends keyof DependencyManifest>( k : K, componentDependencyChain: (keyof DependencyManifest)[]) : DependencyManifest[K] =>  {
        const kComponent = context[k];
        if (componentDependencyHasBeenResolved.has(k)) {
            return kComponent as DependencyManifest[K];
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
                    kComponent.depends[eachDependencyKey] = dependencyOfKComponentForTheDependencyKey as DependencyManifest[typeof eachDependencyKey];
                }
            } else {
                // kComponent is not a component, nothing to do
            }
            componentDependencyHasBeenResolved.add(k);
            return kComponent as DependencyManifest[K];
        }
    };
    if (!lazy) {
        // eagerly resolve all components
        for (const key of Object.getOwnPropertyNames(context) as (keyof DependencyManifest)[]) {
            circularDependencyAwareContainer(key, []);
        }
    }
    return (k) => circularDependencyAwareContainer(k, []);
}