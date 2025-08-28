const querymodel = require('../../models/querydetail');
const responsecon = require('../../helper/response');
const helper=require('../../helper/helper');
const catagorym = require('../../models/category');
const subcatagorym = require('../../models/subcategory')
const teacherm=require('../../models/teachers');
const systemlogm = require('../../models/systemlogs');
const commentm = require('../../models/comment')
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
    async fetchallquery(req,res){
        try{
            const allquery = await querymodel.findAll({
                where:{createdby:req.user.sid,isdeleted:false,deletedAt:null},
                attributes:['queryid','status','assignnow','catagoryid','subcaragoryid'],
                include:{
                    model:catagorym,
                    as:'cataginfo',
                    attributes:['title'],
                    include:{
                    model:subcatagorym,
                    as:'subcatinfo',
                    attributes:['title']
                    }
                },
                include:{
                    model:teacherm,
                    as:'teacherinfo',
                    attributes:['nanme','role']
                }
            });
            return responsecon.successresponsewithdata(res,"Data fetched successfully",allquery);
        }catch(err){
            return responsecon.failedresponse(res,"Server is busy please try later");
        }
    } 
    // fetch particular query 
    async fetchparticularquerycomments(req,res){
        const{queryid}=req.body;
        if(!queryid) return responsecon.failedresponse(res,"Invalid query deails");
        try{
            const fetchquery=await querymodel.findOne({
                where:{queryid:queryid,createdby:req.user.sid},
                attributes:['assignnow','status','catagoryid','subcaragoryid'],
            });
            if(!fetchquery) return responsecon.failedresponse(res,"Invalid query id");
            // fetch for comments 
            const comm = await commentm.findAll({
                where:{queryid:queryid,deletedAt:null},
                attributes:['message','createdBy']
            });
            return responsecon.successresponsewithdata(res,'comment fetched ',comm)
        }catch(err){

        }
    }
    // fetch comments on that query 
    /// fetch msgs on that query 
    // send msgs on that query
    
}
module.exports=new Querycontroller();