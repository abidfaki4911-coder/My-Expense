// ==========================================
// MyExpense - Complete Finance System
// ==========================================


// ---------- DATA ----------

let transactions =
    JSON.parse(
        localStorage.getItem("transactions")
    ) || [];

let recurringExpenses =
    JSON.parse(
        localStorage.getItem("recurringExpenses")
    ) || [];

let budgets =
    JSON.parse(
        localStorage.getItem("budgets")
    ) || {};


// ---------- START APP ----------

window.onload = function () {

    setCurrentMonth();

    showDashboard();

};


// ---------- CURRENT MONTH ----------

function setCurrentMonth() {

    let now = new Date();

    let month =
        now.getFullYear() +
        "-" +
        String(
            now.getMonth() + 1
        ).padStart(2, "0");

    document.getElementById(
        "monthSelector"
    ).value = month;
}


// ---------- CHANGE MONTH ----------

function changeMonth(amount) {

    let input =
        document.getElementById(
            "monthSelector"
        );

    let current =
        new Date(
            input.value + "-01"
        );

    current.setMonth(
        current.getMonth() + amount
    );

    input.value =
        current.getFullYear() +
        "-" +
        String(
            current.getMonth() + 1
        ).padStart(2, "0");

    showDashboard();
}


// ---------- GET SELECTED MONTH ----------

function getSelectedMonth() {

    return document.getElementById(
        "monthSelector"
    ).value;
}


// ---------- OPEN FORM ----------

function openForm(type) {

    let title =
        type === "income"
            ? "Add Income"
            : "Add Expense";


    document.getElementById(
        "formArea"
    ).innerHTML = `

        <div class="form">

            <h2>${title}</h2>

            <input
                type="text"
                id="description"
                placeholder="Description"
            >

            <input
                type="number"
                id="amount"
                placeholder="Amount"
                min="1"
            >

            <select id="category">

                <option value="Food">
                    Food
                </option>

                <option value="Transport">
                    Transport
                </option>

                <option value="Shopping">
                    Shopping
                </option>

                <option value="Education">
                    Education
                </option>

                <option value="Salary">
                    Salary
                </option>

                <option value="Bills">
                    Bills
                </option>

                <option value="Health">
                    Health
                </option>

                <option value="Entertainment">
                    Entertainment
                </option>

                <option value="Other">
                    Other
                </option>

            </select>

            <input
                type="date"
                id="date"
            >

            <button
                onclick="saveTransaction('${type}')">
                Save Transaction
            </button>

        </div>
    `;


    // Default date

    document.getElementById(
        "date"
    ).value =
        new Date()
        .toISOString()
        .split("T")[0];
}


// ---------- SAVE TRANSACTION ----------

function saveTransaction(type) {

    let description =
        document.getElementById(
            "description"
        ).value.trim();

    let amount =
        Number(
            document.getElementById(
                "amount"
            ).value
        );

    let category =
        document.getElementById(
            "category"
        ).value;

    let date =
        document.getElementById(
            "date"
        ).value;


    if (
        description === "" ||
        amount <= 0 ||
        date === ""
    ) {

        alert(
            "Please fill all fields correctly."
        );

        return;
    }


    let transaction = {

        id: Date.now(),

        type: type,

        description: description,

        amount: amount,

        category: category,

        date: date
    };


    transactions.push(
        transaction
    );


    saveAllData();


    document.getElementById(
        "formArea"
    ).innerHTML = "";


    showDashboard();
}


// ---------- SAVE DATA ----------

function saveAllData() {

    localStorage.setItem(
        "transactions",
        JSON.stringify(transactions)
    );

    localStorage.setItem(
        "recurringExpenses",
        JSON.stringify(
            recurringExpenses
        )
    );

    localStorage.setItem(
        "budgets",
        JSON.stringify(budgets)
    );
}


// ---------- GET MONTH TRANSACTIONS ----------

function getMonthTransactions(month) {

    return transactions.filter(
        function(item) {

            return item.date.startsWith(
                month
            );

        }
    );
}


// ---------- DASHBOARD ----------

function showDashboard() {

    let month =
        getSelectedMonth();


    let monthTransactions =
        getMonthTransactions(
            month
        );


    let income = 0;

    let expense = 0;


    monthTransactions.forEach(
        function(item) {

            if (
                item.type === "income"
            ) {

                income += item.amount;

            } else {

                expense += item.amount;

            }

        }
    );


    let saving =
        income - expense;


    // Main Balance

    document.getElementById(
        "balance"
    ).innerText =
        money(saving);


    document.getElementById(
        "income"
    ).innerText =
        money(income);


    document.getElementById(
        "expense"
    ).innerText =
        money(expense);


    // Monthly overview

    document.getElementById(
        "monthlyIncome"
    ).innerText =
        money(income);


    document.getElementById(
        "monthlyExpense"
    ).innerText =
        money(expense);


    document.getElementById(
        "monthlySaving"
    ).innerText =
        money(saving);


    // Other sections

    updateBudget(
        month,
        expense
    );

    updateComparison(
        month
    );

    showRecurring();

    showCategoryChart(
        monthTransactions
    );

    showTransactions(
        monthTransactions
    );
}


// ---------- MONEY FORMAT ----------

function money(amount) {

    return "৳ " +
        Number(amount)
        .toLocaleString(
            "en-BD"
        );
}


// ---------- BUDGET ----------

function setBudget() {

    let month =
        getSelectedMonth();

    let oldBudget =
        budgets[month] || 0;


    let value =
        prompt(
            "Set monthly budget:",
            oldBudget
        );


    if (
        value === null
    ) {

        return;
    }


    value =
        Number(value);


    if (
        value < 0 ||
        isNaN(value)
    ) {

        alert(
            "Please enter a valid amount."
        );

        return;
    }


    budgets[month] =
        value;


    saveAllData();

    showDashboard();
}


// ---------- UPDATE BUDGET ----------

function updateBudget(
    month,
    expense
) {

    let budget =
        budgets[month] || 0;


    let remaining =
        budget - expense;


    document.getElementById(
        "budgetAmount"
    ).innerText =
        money(budget);


    document.getElementById(
        "budgetRemaining"
    ).innerText =
        money(remaining);


    let progress = 0;


    if (
        budget > 0
    ) {

        progress =
            (expense / budget) * 100;

        progress =
            Math.min(
                progress,
                100
            );
    }


    document.getElementById(
        "budgetProgress"
    ).style.width =
        progress + "%";
}


// ---------- MONTH COMPARISON ----------

function updateComparison(
    currentMonth
) {

    let current =
        getMonthTransactions(
            currentMonth
        );


    let currentExpense =
        getExpenseTotal(
            current
        );


    let previousDate =
        new Date(
            currentMonth + "-01"
        );


    previousDate.setMonth(
        previousDate.getMonth() - 1
    );


    let previousMonth =
        previousDate.getFullYear() +
        "-" +
        String(
            previousDate.getMonth() + 1
        ).padStart(2, "0");


    let previous =
        getMonthTransactions(
            previousMonth
        );


    let previousExpense =
        getExpenseTotal(
            previous
        );


    document.getElementById(
        "currentMonthExpense"
    ).innerText =
        money(currentExpense);


    document.getElementById(
        "previousMonthExpense"
    ).innerText =
        money(previousExpense);


    let text =
        document.getElementById(
            "changeText"
        );


    if (
        previousExpense === 0
    ) {

        if (
            currentExpense === 0
        ) {

            text.innerText =
                "No expense data for comparison.";

        } else {

            text.innerText =
                "No previous month expense data.";
        }

        return;
    }


    let difference =
        currentExpense -
        previousExpense;


    let percentage =
        (
            difference /
            previousExpense
        ) * 100;


    percentage =
        percentage.toFixed(1);


    if (
        difference > 0
    ) {

        text.innerText =
            "Expense increased by " +
            money(difference) +
            " (" +
            percentage +
            "%)";

    } else if (
        difference < 0
    ) {

        text.innerText =
            "Expense decreased by " +
            money(
                Math.abs(difference)
            ) +
            " (" +
            Math.abs(percentage) +
            "%)";

    } else {

        text.innerText =
            "Expense is unchanged.";
    }
}


// ---------- EXPENSE TOTAL ----------

function getExpenseTotal(
    list
) {

    let total = 0;


    list.forEach(
        function(item) {

            if (
                item.type === "expense"
            ) {

                total += item.amount;

            }

        }
    );


    return total;
}


// ---------- TRANSACTIONS ----------

function showTransactions(
    list
) {

    let container =
        document.getElementById(
            "transactionList"
        );


    document.getElementById(
        "transactionCount"
    ).innerText =
        list.length +
        " transactions";


    if (
        list.length === 0
    ) {

        container.innerHTML = `
            <p class="empty">
                No transactions for this month.
            </p>
        `;

        return;
    }


    container.innerHTML = "";


    let sorted =
        [...list].sort(
            function(a, b) {

                return b.date.localeCompare(
                    a.date
                );

            }
        );


    sorted.forEach(
        function(item) {

            let income =
                item.type === "income";


            let sign =
                income ? "+" : "-";


            let className =
                income
                    ? "income-text"
                    : "expense-text";


            container.innerHTML += `

                <div class="transaction">

                    <div class="transaction-info">

                        <strong>
                            ${escapeHTML(
                                item.description
                            )}
                        </strong>

                        <p>
                            ${escapeHTML(
                                item.category
                            )}
                            •
                            ${item.date}
                        </p>

                        <button
                            class="delete-btn"
                            onclick="deleteTransaction(${item.id})">
                            Delete
                        </button>

                    </div>


                    <strong
                        class="${className}">
                        ${sign}
                        ${money(item.amount)}
                    </strong>

                </div>

            `;
        }
    );
}


// ---------- DELETE ----------

function deleteTransaction(
    id
) {

    let answer =
        confirm(
            "Delete this transaction?"
        );


    if (!answer) {

        return;
    }


    transactions =
        transactions.filter(
            function(item) {

                return item.id !== id;

            }
        );


    saveAllData();

    showDashboard();
}


// ---------- RECURRING FORM ----------

function openRecurringForm() {

    document.getElementById(
        "formArea"
    ).innerHTML = `

        <div class="form">

            <h2>Add Regular Expense</h2>

            <input
                type="text"
                id="regularName"
                placeholder="Example: House Rent"
            >

            <input
                type="number"
                id="regularAmount"
                placeholder="Amount"
            >

            <select id="regularCategory">

                <option>
                    Rent
                </option>

                <option>
                    Internet
                </option>

                <option>
                    Electricity
                </option>

                <option>
                    Education
                </option>

                <option>
                    Transport
                </option>

                <option>
                    Other
                </option>

            </select>

            <button
                onclick="saveRecurring()">
                Save Regular Expense
            </button>

        </div>

    `;
}


// ---------- SAVE RECURRING ----------

function saveRecurring() {

    let name =
        document.getElementById(
            "regularName"
        ).value.trim();

    let amount =
        Number(
            document.getElementById(
                "regularAmount"
            ).value
        );

    let category =
        document.getElementById(
            "regularCategory"
        ).value;


    if (
        name === "" ||
        amount <= 0
    ) {

        alert(
            "Enter valid information."
        );

        return;
    }


    recurringExpenses.push({

        id: Date.now(),

        name: name,

        amount: amount,

        category: category

    });


    saveAllData();


    document.getElementById(
        "formArea"
    ).innerHTML = "";


    showDashboard();
}


// ---------- SHOW RECURRING ----------

function showRecurring() {

    let list =
        document.getElementById(
            "recurringList"
        );


    if (
        recurringExpenses.length === 0
    ) {

        list.innerHTML = `
            <p class="empty">
                No regular expenses added.
            </p>
        `;

        return;
    }


    list.innerHTML = "";


    recurringExpenses.forEach(
        function(item) {

            list.innerHTML += `

                <div class="recurring-item">

                    <div>

                        <strong>
                            ${escapeHTML(
                                item.name
                            )}
                        </strong>

                        <p>
                            ${item.category}
                        </p>

                    </div>

                    <div>

                        <strong>
                            ${money(
                                item.amount
                            )}
                        </strong>

                        <button
                            class="recurring-delete"
                            onclick="deleteRecurring(${item.id})">
                            ×
                        </button>

                    </div>

                </div>

            `;
        }
    );
}


// ---------- DELETE RECURRING ----------

function deleteRecurring(id) {

    recurringExpenses =
        recurringExpenses.filter(
            function(item) {

                return item.id !== id;

            }
        );


    saveAllData();

    showDashboard();
}


// ---------- CATEGORY CHART ----------

function showCategoryChart(
    list
) {

    let totals = {};


    list.forEach(
        function(item) {

            if (
                item.type !== "expense"
            ) {

                return;
            }


            if (
                !totals[item.category]
            ) {

                totals[item.category] =
                    0;
            }


            totals[item.category] +=
                item.amount;

        }
    );


    let container =
        document.getElementById(
            "categoryChart"
        );


    let categories =
        Object.keys(totals);


    if (
        categories.length === 0
    ) {

        container.innerHTML = `
            <p class="empty">
                No expense data.
            </p>
        `;

        return;
    }


    let max =
        Math.max(
            ...Object.values(
                totals
            )
        );


    container.innerHTML = "";


    categories.forEach(
        function(category) {

            let amount =
                totals[category];


            let width =
                (amount / max) * 100;


            container.innerHTML += `

                <div class="category-row">

                    <div class="category-head">

                        <span>
                            ${escapeHTML(
                                category
                            )}
                        </span>

                        <strong>
                            ${money(amount)}
                        </strong>

                    </div>

                    <div class="category-bar">

                        <div
                            class="category-fill"
                            style="width:${width}%">
                        </div>

                    </div>

                </div>

            `;
        }
    );
}


// ---------- BACKUP EXPORT ----------

function exportData() {

    let data = {

        transactions:
            transactions,

        recurringExpenses:
            recurringExpenses,

        budgets:
            budgets

    };


    let json =
        JSON.stringify(
            data,
            null,
            2
        );


    let blob =
        new Blob(
            [json],
            {
                type:
                    "application/json"
            }
        );


    let url =
        URL.createObjectURL(
            blob
        );


    let link =
        document.createElement(
            "a"
        );


    link.href = url;

    link.download =
        "MyExpense-Backup.json";


    link.click();


    URL.revokeObjectURL(
        url
    );
}


// ---------- BACKUP IMPORT ----------

function importData(event) {

    let file =
        event.target.files[0];


    if (!file) {

        return;
    }


    let reader =
        new FileReader();


    reader.onload =
        function(e) {

            try {

                let data =
                    JSON.parse(
                        e.target.result
                    );


                transactions =
                    data.transactions || [];


                recurringExpenses =
                    data.recurringExpenses || [];


                budgets =
                    data.budgets || {};


                saveAllData();

                showDashboard();


                alert(
                    "Backup restored successfully!"
                );

            } catch (error) {

                alert(
                    "Invalid backup file."
                );
            }

        };


    reader.readAsText(file);
}


// ---------- SECURITY ----------

function escapeHTML(text) {

    let div =
        document.createElement(
            "div"
        );

    div.textContent = text;

    return div.innerHTML;
}