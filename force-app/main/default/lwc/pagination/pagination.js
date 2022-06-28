//import EmailPreferencesStayInTouchReminder from '@salesforce/schema/User.EmailPreferencesStayInTouchReminder';
import { LightningElement,api } from 'lwc';

export default class Pagination extends LightningElement {

    recordsSize = 5;
    currentPage = 1;
    visibleRecords;
    totalPage = 0;
    allRecords;
   
    get records(){
        return this.allRecords;
    }
    @api
    set records(data){
        if(data){    
        this.allRecords = data;
        this.visibleRecords = this.allRecords.slice(0, this.recordsSize);
        this.totalPage = Math.ceil(data.length/this.recordsSize);
        this.currentPage = 1;
        this.updatePage();
        }
    }
    @api setR(data){
        if(data){    
            this.allRecords = data;
            this.visibleRecords = this.allRecords.slice(0, this.recordsSize);
            this.totalPage = Math.ceil(data.length/this.recordsSize);
            this.currentPage = 1;
            this.updatePage();
            }
    }

    updatePage() {
        const start = (this.currentPage-1)*this.recordsSize;
        const end = this.recordsSize*this.currentPage;
        this.visibleRecords = this.allRecords.slice(start,end);
        this.dispatchEvent(new CustomEvent('update',{
            detail:{
                records:this.visibleRecords
            }
        }))
        //this.totalPage = this.allRecords.length;
        console.log(this.totalPage);
        //this.selectedRows = this.pageData.map(row => row.id).filter(pageId => this.allSelectedRows.has(pageId))
      }

    previous(){
       if(this.currentPage>1){
        this.currentPage = this.currentPage - 1 
    this.updatePage()
       }
    }

    next() {
        if(this.currentPage < this.totalPage){
        this.currentPage =  this.currentPage + 1
        this.updatePage()
        }
    }
    get disablePrevious(){
        return this.currentPage<=1;
    }
    get disableNext(){
        return this.currentPage>=this.totalPage;
    }


}