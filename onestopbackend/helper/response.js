class Responsecon{
     successresponse(res,msg){
        return res.status(200).json({
            txn:true,msg:msg
        })
    }
    successresponsewithdata(res,msg,data){
        return res.status(200).json({
            txn:true,
            msg:msg,
            data:data
        })
    }
    failedresponse(res,msg){
        return res.status(400).json({
            txn:false,msg:msg
        })
    }
    servererrorresponse(res){
        return res.status(500).json({
            txn:false,msg:"Please try again"
        })
    }

}
module.exports =new Responsecon();