import { LightningElement, track, wire } from 'lwc';
 import { NavigationMixin } from 'lightning/navigation';
 import { ShowToastEvent } from 'lightning/platformShowToastEvent';
 import { refreshApex } from '@salesforce/apex';
 import getTasks from '@salesforce/apex/RowActionsHandler.getTasks';
 import deleteTask from '@salesforce/apex/RowActionsHandler.deleteTask';
 import getFilteredTask from '@salesforce/apex/RowActionsHandler.getFilteredTask';
//import { subscribe, unsubscribe, onError } from 'lightning/empApi';

 //define row actions
 const actions = [
    { label: 'View', name: 'view' },
    { label: 'Edit', name: 'edit' },
    { label: 'Delete', name: 'delete' }
 ];

 //define datatable columns with row actions
 const columns = [
    { label: 'Subject', fieldName: "recordLink",  
    type: "url",  
    typeAttributes: { label: { fieldName: "Subject" }, tooltip:"Subject", target: "_blank" } 
},
    { label: 'Due Date', fieldName: 'ActivityDate' },
    { label: 'Status', fieldName: 'Status' },
    { label: 'Priority', fieldName: 'Priority' },
    { label: 'Assigned to', fieldName: 'ownerURL', type: "url",
    typeAttributes: { label: { fieldName: "OwnerName" }, tooltip: "OwnerName", target: "_blank" }
},
{
    type: 'action',
    typeAttributes: {
        rowActions: actions,
        menuAlignment: 'right'
    }
}
 ];

 export default class RowActionLWC extends NavigationMixin(LightningElement) {
    @track data;
    @track columns = columns;
    @track showLoadingSpinner = false;
    recordId;    
    refreshTable;
    @track isModalOpened = false;
    error;
    TaskList;
    subscription = {};
    CHANNEL_NAME = '/event/RefreshDataTable__e';
    newdata;

    updateallTaskHandler(event){
        this.TaskList = [...event.detail.records];
    }

    handleOpenModal(event){
        console.log('12345')
        this.isModalOpened = true;
    }
    handleModalClose(){
        this.isModalOpened = false;
        console.log('this.isModalOpened - >', this.isModalOpened);
    }

    connectedCallback() {
            getTasks().then(data => {
                let i = 1;
                let tempTaskList = [];
                this.data = data; //looking at displaying 10 recrods per page
                for (let x = 0; x < data.length; x++) {  
                    let tempRecord = Object.assign({}, data[x]); //cloning object  
                    tempRecord.recordLink = "/" + tempRecord.Id;
                    tempRecord.ownerURL = "/" + tempRecord.OwnerId;
                    tempRecord.OwnerName = tempRecord.Owner.Name; 
                    tempTaskList.push(tempRecord);  
                }  
                console.log(tempTaskList);
                this.TaskList = tempTaskList;//.forEach(item => item['nameUrl'] = '/lightning/' +item['Id'] +'/view');
            });
    }
    // connectedCallback() {
    //     subscribe(this.CHANNEL_NAME, -1, this.handleEvent).then(response => {
    //         console.log('Successfully subscribed to channel');
    //         this.subscription = response;
    //     });

    //     onError(error => {
    //         console.error('Received error from server: ', error);
    //     });
    // }

    // handleEvent = event => {
    //     const refreshRecordEvent = event.data.payload;
    //     if (refreshRecordEvent.RecordId__c === this.recordId) {
    //         this.recordId='';
    //         return refreshApex(this.refreshTable);
    //     }
    // }

    // disconnectedCallback() {
    //     unsubscribe(this.subscription, () => {
    //         console.log('Successfully unsubscribed');
    //     });
    // }

    // retrieving the Tasks using wire service
    @wire(getTasks)
    Tasks(result) {
        this.refreshTable = result;
        if (result.data) {
            this.data = result.data;
            this.error = undefined;

        } else if (result.error) {
            this.error = result.error;
            this.data = undefined;
        }
    }

    handleRowActions(event) {
        const actionName = event.detail.action.name;
        const row = event.detail.row;
        this.recordId = row.Id;
        switch (actionName) {
            case 'view':
                this[NavigationMixin.Navigate]({
                    type: 'standard__recordPage',
                    attributes: {
                        recordId: row.Id,
                        actionName: 'view'
                    }
                });
                break;
            case 'edit':
                this[NavigationMixin.Navigate]({
                    type: 'standard__recordPage',
                    attributes: {
                        recordId: row.Id,
                        objectApiName: 'Task',
                        actionName: 'edit'
                    }
                });
                break;
            case 'delete':
                this.delTask(row);
                break;
        }
    }

    delTask(currentRow) {
        this.showLoadingSpinner = true;
        deleteTask({ objTask: currentRow }).then(result => {
            this.showLoadingSpinner = false;
            this.dispatchEvent(new ShowToastEvent({
                title: 'Success!!',
                message: currentRow.subject + ' Task deleted.',
                variant: 'success'
            }));
            return refreshApex(this.refreshTable);
        }).catch(error => {
            window.console.log('Error ====> ' + error);
            this.showLoadingSpinner = false;
            this.dispatchEvent(new ShowToastEvent({
                title: 'Error!!',
                message: JSON.stringify(error),
                variant: 'error'
            }));
        });
    }
    handlerFirstDate(e) {
        this.FirstDate = e.target.value
    }
    handlerSecondDate(e) {
        this.SecondDate = e.target.value
    }

    @wire(getTasks)
    Tasks(result) {
        this.refreshTable = result;
        if (result.data) {
            this.data = result.data;
            this.error = undefined;

        } else if (result.error) {
            this.error = result.error;
            this.data = undefined;
        }
    }
    buttonDate() {
        console.log('huo');
                getFilteredTask({
                    startDate: this.FirstDate,
                    endDate: this.SecondDate,
                    offsetRange: this.offsetRange
                }).then(result => {
                    this.TaskList = result;
                     let pag = this.template.querySelector('c-pagination');
                    console.log(pag);
                    pag.setR(result);
                    console.log('data' +this.TaskList)
;                });
            }        
 }

