const querymodel = require('../../models/querydetail');
const responsecon = require('../../helper/response');
const helper=require('../../helper/helper');
const catagorym = require('../../models/category');
const subcatagorym = require('../../models/subcategory')
const teacherm=require('../../models/teachers');
const systemlogm = require('../../models/systemlogs');
const commentm = require('../../models/comment');
 
class CommentController{
   
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
                attributes:['message','createdBy'],
                include:[
                    {
                        model:teacherm,
                        as:'teacherinfocomnt',
                        attributes:['tchnam','tchrole','tchdept','techdesig','techcat']
                    }
                ]
            });
            return responsecon.successresponsewithdata(res,'comment fetched ',comm)
        }catch(err){
            return responsecon.failedresponse(res,"Please try after sometime");
        }
    }
    // fetch comments on that query
     async addquerycomments(req,res){
        const{queryid,msg}=req.body;
        if(!queryid||!msg) return responsecon.failedresponse(res,"Invalid query deails");
        try{
            const fetchquery=await querymodel.findOne({
                where:{queryid:queryid,deletedAt:null},
                attributes:['assignnow','status','catagoryid','subcaragoryid'],
            });
            if(!fetchquery) return responsecon.failedresponse(res,"Invalid query id");
            // fetch for comments 
            const comm = await commentm.create({
                queryid:queryid,
                message:msg,
                createdBy:req.user.tchid
            });
            if(!comm) return responsecon.failedresponse(res,"Comment add failed")
            return responsecon.successresponse(res,'comment Created Successfully');
        }catch(err){
            return responsecon.failedresponse(res,"Please try after sometime");
        }
    }
    /// fetch msgs on that query 
    // send msgs on that query
    
}
module.exports=new CommentController();