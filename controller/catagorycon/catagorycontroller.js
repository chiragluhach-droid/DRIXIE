const responsecon = require('../../helper/response');
const helper=require('../../helper/helper');
const catagorym = require('../../models/category');
const subcatagorym = require('../../models/subcategory');
const systemlog = require('../../models/systemlogs')
class CatagoryController{
    
    // fetch query list
    async fetchallcatagorywithsub(req,res){
        try{
            const allquery = await catagorym.findAll({
                where:{deletedAt:null},
                include:{
                     model:subcatagorym,
                    as:'subcatinfo',
                    where:{isactive:true},
                    attributes:['title','description','responsetime']
                },
            });
            return responsecon.successresponsewithdata(res,"Data fetched successfully",allquery);
        }catch(err){
            await systemlog.create({
                userId:req.user.sid||req.user.tchid,
                action:'fetch_catagory_subcat',
                functionName:'fetchallcatagorywithsub',
                error:err.message,
                params:req.body,
                ip:req.ip
                // userAgent:`${deviceid}-${ltd}-${lgntd}`
            });
            return responsecon.failedresponse(res,"Server is busy please try later");

        }
    } 
    // fetch particular query 
    // fetch comments on that query 
    /// fetch msgs on that query 
    // send msgs on that query
    
}
module.exports=new CatagoryController();