import mongoose from "mongoose";


const paymentSchema = new mongoose.Schema(
{
    order:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Order",
        required:true
    },


    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },


    paymentMethod:{
        type:String,
        enum:[
            "Cash",
            "Zaad",
            "Edahab"
        ],
        default:"Cash"
    },


    paymentStatus:{
        type:String,
        enum:[
            "Pending",
            "Paid",
            "Failed"
        ],
        default:"Pending"
    },


    amount:{
        type:Number,
        required:true
    },


    transactionId:{
        type:String
    }

},
{
    timestamps:true
});


const Payment = mongoose.model("payment", paymentSchema)
export default Payment