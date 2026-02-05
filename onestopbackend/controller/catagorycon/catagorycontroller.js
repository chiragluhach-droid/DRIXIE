const responsecon = require('../../helper/response');
const helper = require('../../helper/helper');
const catagorym = require('../../models/category');
const subcatagorym = require('../../models/subcategory');
const systemlog = require('../../models/systemlogs')
class CatagoryController {
    // create catagory
    async createcatagory(req,res){
        
    }
    // fetch query list
    async fetchallcatagorywithsub(req, res) {
        try {
            const allquery = await catagorym.findAll();
            return responsecon.successresponsewithdata(res, "Data fetched successfully", allquery);
        } catch (err) {

            console.log(err); await systemlog.create({
                userId: req.user.sid || req.user.tchid,
                action: 'fetch_catagory_subcat',
                functionName: 'fetchallcatagorywithsub',
                error: err.message,
                params: req.body,
                ip: req.ip
                // userAgent:`${deviceid}-${ltd}-${lgntd}`
            });
            return responsecon.failedresponse(res, "Server is busy please try later");

        }
    }
    async fetchallsubcatagorywithsub(req, res) {
        const { ctgid } = req.body;
        if (!ctgid) return responsecon.failedresponse(res, "Invalid catagory id")
        try {
            const allquery = await subcatagorym.findAll({
                where: { deletedAt: null, isactive: true, categoryId:ctgid }
            });
            return responsecon.successresponsewithdata(res, "Data fetched successfully", allquery);
        } catch (err) {

            console.log(err); await systemlog.create({
                userId: req.user.sid || req.user.tchid,
                action: 'fetch_catagory_subcat',
                functionName: 'fetchallcatagorywithsub',
                error: err.message,
                params: req.body,
                ip: req.ip
                // userAgent:`${deviceid}-${ltd}-${lgntd}`
            });
            return responsecon.failedresponse(res, "Server is busy please try later");

        }
    }
    // fetch particular query 
    // fetch comments on that query 
    /// fetch msgs on that query 
    // send msgs on that query

}
module.exports = new CatagoryController();