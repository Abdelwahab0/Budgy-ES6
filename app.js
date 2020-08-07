var budgetController = (function(){
	
	class Expense {
		constructor(id, description, value){
			this.id = id;
			this.description = description;
			this.value = value;
			this.percentage = -1;
		} 
		calcPercentage (totalIncome){
			if (totalIncome > 0){
				this.percentage = Math.round((this.value / totalIncome) * 100);
			} else{
				this.percentage = -1;
			}
		}
		getPercentage(){
			return this.percentage;
		}

	};

	class Income {
		constructor(id,description,value){
			this.id = id;
			this.description = description;
			this.value = value;
		}
	};

	const calaculateTotal = (type)=>{
		let sum = 0;
		data.allItems[type].forEach(cur=> sum += cur.value);
		data.totals[type] = sum;
	};

	let data = {
		allItems:{
			exp: [],
			inc: []
		},
		totals:{
			exp: 0,
			inc: 0
		},
		budget:0,
		percentage:-1
	};


	return{
		calcBudget:()=>{
			//Calculate Totals
			calaculateTotal('inc');
			calaculateTotal('exp');
			//Calculate Budget
			data.budget = data.totals.inc - data.totals.exp;
			//Calculate the percentage of income that we spent
			if(data.totals.inc>0){
				data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
			}else{
				data.percentage = -1;
			}

		},
		getPercentages:()=>{
			const allPerc = data.allItems.exp.map(cur=>{
				return cur.getPercentage();
			});
			return allPerc;
		},
		calcPercentages:()=>{
			data.allItems.exp.forEach(cur=> cur.calcPercentage(data.totals.inc));
		},
		getBudget:()=>{
			return {
				budget: data.budget,
				totalInc: data.totals.inc,
				totalExp: data.totals.exp,
				percentage: data.percentage
			}
		},
		addItem: (type, dis, val)=>{
			let ID, newItem;
			//create new ID
			if(data.allItems[type].length > 0){
				ID = data.allItems[type][data.allItems[type].length -1].id + 1;
			} else {
				ID = 0;
			}
			//Create new Item based on 'inc' or 'exp'
			if (type === 'exp'){
				newItem = new Expense(ID, dis, val);
			} else if(type === 'inc'){
				newItem = new Income(ID, dis, val);
			}
			//Add items to data structure
			data.allItems[type].push(newItem);

			//Return new element
			return newItem;
		}, delteItem:(type, id)=>{
			let ids, index;

			ids = data.allItems[type].map(cur=>{
				return cur.id
			});

			index = ids.indexOf(id);

			if (index !== -1){
			data.allItems[type].splice(index, 1);
			}
		}

	}

})();

var UIController = (function(){
	
	const DOMstrings = {
		inputBtn: '.add__btn',
		inputType: '.add__type',
		inputDescription:'.add__description',
		inputValue: '.add__value',
		incomeContainer:'.income__list',
		expensesContainer:'.expenses__list',
		budgetLabel:'.budget__value',
		incomeLabel:'.budget__income--value',
		expensesLabel:'.budget__expenses--value',
		percentageLabel:'.budget__expenses--percentage',
		expPerLable:'.item__percentage',
		container:'.container',
		DateLable:'.budget__title--month'
	};

	const formatNumber = (num, type)=>{
		let numSplit, int, dec;

		num = Math.abs(num);
		num = num.toFixed(2);

		numSplit = num.split('.');

		int = numSplit[0];
		if(int.length > 3){
			int = int.substr(0, int.length -3) + ','  + int.substr(int.length -3, int.length);
		}

		dec = numSplit[1];
		return (type === 'exp' ? '- ' : '+ ') + int + '.' + dec;
	};



	return {
	 getInput:()=>{
		return{
				type:document.querySelector(DOMstrings.inputType).value,
				description:document.querySelector(DOMstrings.inputDescription).value,
				value:parseFloat(document.querySelector(DOMstrings.inputValue).value)
			};
		}, 
		displayBudget:(obj)=>{
			let type;
			obj.budget > 0 ? type = 'inc' : type = 'exp';
			document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
			document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
			document.querySelector(DOMstrings.expensesLabel).textContent =formatNumber(obj.totalExp, 'exp');

			if(obj.percentage > 0){
				document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
			}else{
				document.querySelector(DOMstrings.percentageLabel).textContent = '---'
			}
		},
		displayPercentages:(percentages)=>{
			const fields = document.querySelectorAll(DOMstrings.expPerLable);
			Array.from(fields).forEach((cur, index)=>{
				if(percentages[index]> 0){
					cur.textContent = percentages[index] + '%';
				}else{
					cur.textContent = '---';
				}
				
			});
		},displayDate:()=>{
			let now, month, months, year;
			now = new Date();
			months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
			month = now.getMonth();
			year = now.getFullYear();

			document.querySelector(DOMstrings.DateLable).textContent = months[month] + ' ' + year;
		},changedType:()=>{
			let fields = document.querySelectorAll(DOMstrings.inputType+','+DOMstrings.inputDescription+','+DOMstrings.inputValue);
			Array.from(fields).forEach(cur=> cur.classList.toggle('red-focus'));

			document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
		},	addListItem:(obj, type)=>{
			let html, element;
			//Create HTML string with placeholder text
		    if (type === 'inc'){
		    	element = DOMstrings.incomeContainer;
		    	html= `<div class="item clearfix" id="inc-${obj.id}">
                            <div class="item__description">${obj.description}</div>
                            <div class="right clearfix">
                                <div class="item__value">${formatNumber(obj.value, 'inc')}</div>
                                <div class="item__delete">
                                    <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                                </div>
                            </div>
                        </div>`;

		    }else if(type === 'exp'){
		    	//Replace the place holder text with some actual data
		    element = DOMstrings.expensesContainer;
		    html = `<div class="item clearfix" id="exp-${obj.id}">
                            <div class="item__description">${obj.description}</div>
                            <div class="right clearfix">
                                <div class="item__value">${formatNumber(obj.value, 'exp')}</div>
                                <div class="item__percentage">${obj.percentage}%</div>
                                <div class="item__delete">
                                    <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                                </div>
                            </div>
                        </div>`;
		    }
		document.querySelector(element).insertAdjacentHTML('beforeend',html);

		}, deleteListItem:(selectorID)=>{
			const el = document.getElementById(selectorID);
			el.parentNode.removeChild(el);

		}, clearFields: ()=>{
			let fields, fieldsArr;
			fields = document.querySelectorAll(DOMstrings.inputDescription + ',' + DOMstrings.inputValue);
			fieldsArr = Array.from(fields);
			fieldsArr.forEach(cur => cur.value = "");
			fieldsArr[0].focus();
		},


		getDOMstrings:()=>{
			return DOMstrings;
		}
	};
})();

var controller = (function(budgetCtrl, UICtrl){
	
	const DOM = UICtrl.getDOMstrings();
	let newItem;

	const updatePercentage = ()=>{
		//Calculate Percentages
		budgetCtrl.calcPercentages();
		//Read the percentages from the budget controller
		let percentages = budgetCtrl.getPercentages();
		//Update the UI with the new percentages
		UICtrl.displayPercentages(percentages);

	}
	
	const updateBudget = ()=>{
		// 1. Calculate the budget
		budgetCtrl.calcBudget();
		//2. Get budget
		const budget = budgetCtrl.getBudget();
		//3. Display budget
		UICtrl.displayBudget(budget);
	}
	

	const ctrlAddItem = ()=>{
		const input = UICtrl.getInput();
		if (input.description !== "" && !isNaN(input.value) && input.value > 0){
		//Creating an input object
		newItem = budgetCtrl.addItem(input.type, input.description, input.value);
		//Getting input value
		UICtrl.addListItem(newItem, input.type);
		//Clear input field
		UICtrl.clearFields();
		//Caculate and update budget
		updateBudget();
		//Calculate Percentages
		updatePercentage();
		}
	};

	//Deleting items
	const ctrlDeleteItem = (event)=>{
		let itemID,splitID, type, ID;
		itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
		if(itemID){
		//inc-0
		splitID = itemID.split('-');
		type = splitID[0];
		ID = parseInt(splitID[1]);

		//1.Delete the Item from the Data Structure
		budgetCtrl.delteItem(type,ID);
		//2.Delete the Item from the UI
		UICtrl.deleteListItem(itemID);
		//3.Update budget
		updateBudget();
		//4.Update percentage
		updatePercentage();
		}
	}

//Handling clicks	
document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

//
document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);

//Deleting items
document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem)

//Handling the Return key enter
document.addEventListener('keypress', (event)=>{
 if (event.keyCode === 13 || event.which === 13){
 	ctrlAddItem();
 }
});

return{
	init:()=>{
		console.log('Application has started');
		UICtrl.displayDate();
		UICtrl.displayBudget({
               	budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
	}
}

})(budgetController, UIController);
controller.init();