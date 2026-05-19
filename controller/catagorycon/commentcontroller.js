const querymodel = require('../../models/querydetail');
const responsecon = require('../../helper/response');
const helper=require('../../helper/helper');
const catagorym = require('../../models/category');
const subcatagorym = require('../../models/subcategory')
const teacherm=require('../../models/teachers');
const systemlogm = require('../../models/systemlogs');
const commentm = require('../../models/comment');
 
class CommentController{
    async fetchparticularquerycomments(req,res){
        const{queryid}=req.body;
        if(!queryid) return responsecon.failedresponse(res,"Invalid query deails");
        try{
            const fetchquery=await querymodel.findOne({
                queryid:queryid,createdby:req.user.sid
            }).select('assignnow status catagoryid subcaragoryid');
            if(!fetchquery) return responsecon.failedresponse(res,"Invalid query id");
            
            const comm = await commentm.find({ queryid:queryid }).select('message createdBy');
            return responsecon.successresponsewithdata(res,'comment fetched ',comm)
        }catch(err){
            return responsecon.failedresponse(res,"Please try after sometime");
        }
    }
     async addquerycomments(req,res){
        const{queryid,msg}=req.body;
        if(!queryid||!msg) return responsecon.failedresponse(res,"Invalid query deails");
        try{
            const fetchquery=await querymodel.findOne({
                queryid:queryid
            }).select('assignnow status catagoryid subcaragoryid');
            if(!fetchquery) return responsecon.failedresponse(res,"Invalid query id");
            
            const comm = await commentm.create({
                queryid:queryid,
                message:msg,
                createdBy:req.user.tchid,
                name: req.user.name || req.user.tchnam || "Unknown"
            });
            if(!comm) return responsecon.failedresponse(res,"Comment add failed")
            return responsecon.successresponse(res,'comment Created Successfully');
        }catch(err){
            return responsecon.failedresponse(res,"Please try after sometime");
        }
    }
}
module.exports=new CommentController();