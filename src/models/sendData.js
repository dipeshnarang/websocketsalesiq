const {getAllOperators}=require('./operator')
const {getDepartments}=require('./department')
require('./graph')


// Merging operator and department Data
function updatedData(){
    let operators=getAllOperators()
    let deparments=getDepartments()

    deparments.forEach((dep)=>{
        dep.associatedOperators=[]
    })
    operators.forEach((op)=>{
        
        let dep=deparments.find((dep)=>{
            return dep.id==op.departmentId
        })

        if(dep){
            dep.associatedOperators.push(op)
        }
    })
    return deparments

}

// Sending merged data
function sendDeptData(deptName){
    let deptData=deparments.find((dep)=>{
        return dep.name==deptName
    })

    return deptData
}

module.exports={
    updatedData,
    sendDeptData
}