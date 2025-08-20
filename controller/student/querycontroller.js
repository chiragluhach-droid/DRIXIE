const querymodel = require('../../models/querydetail');
const responsecon = require('../../helper/response');
const helper=require('../../helper/helper');
const catagorym = require('../../models/category');
const subcatagorym = require('../../models/subcategory')
class Querycontroller{
    async userquerycreatedeaft(req,res){
        const{descrip,catagoryid,subcaragoryid}=req.body;
        if(!descrip||!catagoryid) return responsecon.failedresponse(res,"Invalid parameters");
        try{
            let datat = {
                description:descrip,
                createdby:req.user.sid,
                catagoryid:catagoryid,
            }
            if(subcaragoryid){
                 datat.subcaragoryid=subcaragoryid
            }
            const querycreate = await querymodel.create(datat);
            if(!querycreate){
                return responsecon.failedresponse(res,"Query create failed please again");
            }
            return responsecon.successresponse(res,"Query created successfully");
            // attachment allotment 
        }catch(err){
            return responsecon.failedresponse(res,"Please try again server is busy");
        }
    }
    async userquerycreatefinal(req,res){
        const{queryid,descrip,catagoryid,subcaragoryid}=req.body;
        if(!descrip||!catagoryid||!queryid) return responsecon.failedresponse(res,"Invalid parameters");
        try{
            let datat = {
                description:descrip,
                createdby:req.user.sid,
                catagoryid:catagoryid,
            }
            if(subcaragoryid){
                 datat.subcaragoryid=subcaragoryid;
                const subcatagoryde = await subcatagorym.findOne({
                where:{id:subcaragoryid},
                attributes:['name']
            });
            if(!subcatagoryde) return responsecon.failedresponse(res,"Invalid subcaragory")
            }
            /// check catagory 
            const catagorycheck = await catagorym.findOne({
                where:{id:catagoryid},
                attributes:['name']
            });
            if(!catagorycheck) return responsecon.failedresponse(res,"Invalid catagory details")
            const querycreate = await querymodel.create(datat);
            if(!querycreate){
                return responsecon.failedresponse(res,"Query create failed please again");
            }
            const mail= await helper.sendsinglemail(req.user.email,"Query created sucessfully",`Your query regarding the catagory has been registered with ref no ${queryid} nand extimate timing to resolve is `);
            return responsecon.successresponse(res,"Query created successfully");
            // attachment allotment 
        }catch(err){
            return responsecon.failedresponse(res,"Please try again server is busy");
        }
    }
    // fetch query list 
    // fetch particular query 
    // fetch comments on that query 
    /// fetch msgs on that query 
    // send msgs on that query
    
}
module.exports=new Querycontroller();