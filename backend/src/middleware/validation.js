export const validate = (schema, source="body") => (req, res, next) =>{
    const {value, error} = schema.validate(req[source], {
        abortEarly: false,
        stripUnknown: true,
    });
    if(error){
        return res.status(400).json({
            message: "Validation failed",
            errors: error.details.map((d) => d.message),
        });
    }
    
    Object.defineProperty(req, source, {
        value: value,
        writable: true,
        configurable: true,
        enumerable: true
    });
    
    next();
}