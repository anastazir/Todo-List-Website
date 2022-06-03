export const itemsSchema = {
    name: {type:String},
    time:{type:String},
};

export const listSchema = {
    name: String,
    items: [itemsSchema],
};  