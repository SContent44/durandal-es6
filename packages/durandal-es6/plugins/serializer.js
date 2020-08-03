import system from "../core/system";

/**
 * Serializes and deserializes data to/from JSON.
 * @module serializer
 * @requires system
 */
function SerializerModule() {
    /**
     * @class SerializerModule
     * @static
     */
    return {
        /**
         * The name of the attribute that the serializer should use to identify an object's type.
         * @property {string} typeAttribute
         * @default type
         */
        typeAttribute: "type",
        /**
         * The amount of space to use for indentation when writing out JSON.
         * @property {string|number} space
         * @default undefined
         */
        space: undefined,
        /**
         * The default replacer function used during serialization. By default properties starting with '_' or '$' are removed from the serialized object.
         * @method replacer
         * @param {string} key The object key to check.
         * @param {object} value The object value to check.
         * @return {object} The value to serialize.
         */
        replacer(key, value) {
            if (key) {
                const first = key[0];
                if (first === "_" || first === "$") {
                    return undefined;
                }
            }

            return value;
        },
        /**
         * Serializes the object.
         * @method serialize
         * @param {object} object The object to serialize.
         * @param {object} [settings] Settings can specify a replacer or space to override the serializer defaults.
         * @return {string} The JSON string.
         */
        serialize(object, settings) {
            settings = settings === undefined ? {} : settings;

            if (system.isString(settings) || system.isNumber(settings)) {
                settings = { space: settings };
            }

            return JSON.stringify(object, settings.replacer || this.replacer, settings.space || this.space);
        },
        /**
         * Gets the type id for an object instance, using the configured `typeAttribute`.
         * @method getTypeId
         * @param {object} object The object to serialize.
         * @return {string} The type.
         */
        getTypeId(object) {
            if (object) {
                return object[this.typeAttribute];
            }

            return undefined;
        },
        /**
         * Maps type ids to object constructor functions. Keys are type ids and values are functions.
         * @property {object} typeMap.
         */
        typeMap: {},
        /**
         * Adds a type id/constructor function mampping to the `typeMap`.
         * @method registerType
         * @param {string} typeId The type id.
         * @param {function} constructor The constructor.
         */
        registerType() {
            const first = arguments[0];

            if (arguments.length == 1) {
                const id = first[this.typeAttribute] || system.getModelName(first);
                this.typeMap[id] = first;
            } else {
                // eslint-disable-next-line prefer-destructuring
                this.typeMap[first] = arguments[1];
            }
        },
        /**
         * The default reviver function used during deserialization. By default is detects type properties on objects and uses them to re-construct the correct object using the provided constructor mapping.
         * @method reviver
         * @param {string} key The attribute key.
         * @param {object} value The object value associated with the key.
         * @param {function} getTypeId A custom function used to get the type id from a value.
         * @param {object} getConstructor A custom function used to get the constructor function associated with a type id.
         * @return {object} The value.
         */
        reviver(key, value, getTypeId, getConstructor) {
            const typeId = getTypeId(value);
            if (typeId) {
                const ctor = getConstructor(typeId);
                if (ctor) {
                    if (ctor.fromJSON) {
                        return ctor.fromJSON(value);
                    }

                    return new ctor(value);
                }
            }

            return value;
        },
        /**
         * Deserialize the JSON.
         * @method deserialize
         * @param {string} text The JSON string.
         * @param {object} [settings] Settings can specify a reviver, getTypeId function or getConstructor function.
         * @return {object} The deserialized object.
         */
        deserialize(text, settings) {
            const that = this;
            settings = settings || {};

            const getTypeId =
                settings.getTypeId ||
                function (object) {
                    return that.getTypeId(object);
                };
            const getConstructor =
                settings.getConstructor ||
                function (id) {
                    return that.typeMap[id];
                };
            const reviver =
                settings.reviver ||
                function (key, value) {
                    return that.reviver(key, value, getTypeId, getConstructor);
                };

            return JSON.parse(text, reviver);
        },
        /**
         * Clone the object.
         * @method clone
         * @param {object} obj The object to clone.
         * @param {object} [settings] Settings can specify any of the options allowed by the serialize or deserialize methods.
         * @return {object} The new clone.
         */
        clone(obj, settings) {
            return this.deserialize(this.serialize(obj, settings), settings);
        },
    };
}

export default new SerializerModule();
