const taskList = document.querySelector("#task-list");
let currentTask = 0;

const theoryByTask = {
  0: [
    ["1. What is the difference between let and const?", "let can get a new value. const cannot be assigned again."],
    ["2. What does typeof null return?", "It returns object."],
    ["3. What are JavaScript primitive types?", "string, number, boolean, null, undefined, bigint and symbol. Objects and arrays are reference values."]
  ],
  4: [
    ["Why did the original score change?", "copy and original point to the same object."],
    ["Why did the nested city change?", "Spread makes a shallow copy. The address object is still shared."]
  ],
  6: [
    ["Can functions be stored in variables?", "Yes, functions can be stored in variables."],
    ["Can functions be passed to other functions?", "Yes, functions can be passed as arguments."],
    ["What is the difference between add and add()?", "add is the function. add() calls it and gives the result."]
  ],
  7: [
    ["What is global scope?", "A global value can be used in the whole script."],
    ["What is function scope?", "A function value can be used only inside that function."],
    ["What is block scope?", "let and const inside a block stay inside that block."],
    ["What is the difference between var, let and const?", "var has function scope. let and const have block scope. const cannot be assigned again."]
  ],
  8: [
    ["Why can the inner function use count?", "The inner function remembers variables from the outer function. This is a closure."]
  ],
  9: [
    ["What is the difference between spread and rest?", "Spread opens values. Rest collects values into an array."]
  ],
  10: [
    ["What is the difference between || and ??", "|| uses the default for all falsy values. ?? uses it only for null and undefined."]
  ]
};

const hiddenTheoryRows = {
  4: ["Why", "Why nested value changed"],
  6: ["Functions as values", "add and add()"],
  7: ["Global scope", "Function scope", "Block scope", "var, let and const"],
  8: ["Why it works"],
  9: ["Spread and rest"],
  10: ["What I noticed"]
};

function showTask(title, rows) {
  const section = document.createElement("section");
  section.className = "task";
  section.innerHTML = `<h2>${title}</h2>`;

  const results = document.createElement("div");
  results.className = "results";
  const hiddenRows = hiddenTheoryRows[currentTask] || [];

  rows.filter(([name]) => !hiddenRows.includes(name)).forEach(([name, value]) => {
    const line = document.createElement("p");
    line.className = "result";
    const label = document.createElement("strong");
    label.textContent = `${name}:`;
    line.append(label, document.createTextNode(` ${value}`));
    results.append(line);
  });
  section.append(results);

  if (theoryByTask[currentTask]) {
    const theory = document.createElement("div");
    theory.className = "theory";
    theory.innerHTML = "<h3>Theory</h3>";

    theoryByTask[currentTask].forEach(([question, answer]) => {
      const item = document.createElement("div");
      item.className = "theory-item";

      const questionLine = document.createElement("p");
      questionLine.className = "theory-question";
      questionLine.textContent = question;

      const answerLine = document.createElement("p");
      answerLine.className = "theory-answer";
      answerLine.textContent = answer;

      item.append(questionLine, answerLine);
      theory.append(item);
    });

    section.append(theory);
  }

  taskList.append(section);
  currentTask += 1;
}

function text(value) {
  if (value === undefined) return "undefined";
  if (value === null) return "null";

  if (Array.isArray(value)) {
    const separator = value.some(item => typeof item === "object" && item !== null) ? " | " : ", ";
    return value.map(item => text(item)).join(separator);
  }

  if (typeof value === "object") {
    return Object.entries(value)
      .map(([key, item]) => `${key}: ${text(item)}`)
      .join(", ");
  }

  return String(value);
}

// 1. Variables and data types
const studentName = "Abylau";
let studentAge = 19;
const isActive = true;
const courses = ["SIS", "Web Development"];
const studentAddress = { city: "Almaty", street: "Abay Street" };
const emptyValue = null;
let notSet;

showTask("1. Variables and Data Types", [
  ["Student name", `${studentName} - ${typeof studentName}`],
  ["Age", `${studentAge} - ${typeof studentAge}`],
  ["Active", `${isActive} - ${typeof isActive}`],
  ["Courses", `${courses.join(", ")} - ${typeof courses}`],
  ["Address", `${studentAddress.city}, ${studentAddress.street} - ${typeof studentAddress}`],
  ["Phone number", `${text(emptyValue)} - ${typeof emptyValue}`],
  ["Next course", `${text(notSet)} - ${typeof notSet}`],
  ["Sentence", `My name is ${studentName}. I am ${studentAge} years old.`]
]);

// 2. Array methods make new results. The first array stays the same.
const numbers = [3, 7, 2, 10, 5];
const doubled = numbers.map(number => number * 2);
const greaterThanFive = numbers.filter(number => number > 5);
const firstGreaterThanFive = numbers.find(number => number > 5);
const total = numbers.reduce((sum, number) => sum + number, 0);

showTask("2. Arrays", [
  ["Original", text(numbers)],
  ["Multiply by 2", text(doubled)],
  ["Greater than 5", text(greaterThanFive)],
  ["First greater than 5", firstGreaterThanFive],
  ["Sum", total],
  ["Has 10", numbers.includes(10)]
]);

// 3. Work with an array of student objects.
const classStudents = [
  { id: 1, name: "Anna", grade: 85 },
  { id: 2, name: "John", grade: 62 },
  { id: 3, name: "Sara", grade: 91 },
  { id: 4, name: "Mike", grade: 55 }
];
const goodStudents = classStudents.filter(student => student.grade >= 70);
const studentNames = classStudents.map(student => student.name);
const sara = classStudents.find(student => student.id === 3);
const topStudent = classStudents.reduce((top, student) => student.grade > top.grade ? student : top);
const averageGrade = classStudents.reduce((sum, student) => sum + student.grade, 0) / classStudents.length;
const studentsWithStatus = classStudents.map(student => ({ ...student, passed: student.grade >= 60 }));

showTask("3. Arrays of Objects", [
  ["Grade 70 or more", goodStudents.map(student => student.name).join(", ")],
  ["Names", text(studentNames)],
  ["ID 3", text(sara)],
  ["Top student", `${topStudent.name}, ${topStudent.grade}`],
  ["Average grade", averageGrade.toFixed(2)],
  ["Passed status", text(studentsWithStatus)]
]);

// 4. Object changes and destructuring.
const userObject = {
  id: 1,
  name: "Aruzhan",
  age: 20,
  address: { city: "Almaty", street: "Satpaev Street" }
};
const readBeforeChange = `${userObject.name}, ${userObject.address.city}`;
userObject.age = 21;
userObject.email = "aruzhan@example.com";
delete userObject.address.street;
const { name: userName, age } = userObject;
const { address: { city } } = userObject;

showTask("4. Objects", [
  ["Read name and city", readBeforeChange],
  ["Changed object", text(userObject)],
  ["Destructuring", `${userName}, ${age}, ${city}`]
]);

// 5. Two variables can point to the same object.
const original = { name: "Alice", score: 10 };
const copy = original;
copy.score = 20;
const sameReferenceResult = original.score;
const separateCopy = { ...original };
separateCopy.score = 30;

const userWithAddress = { name: "Alice", address: { city: "Almaty" } };
const shallowCopy = { ...userWithAddress };
shallowCopy.address.city = "Astana";
const nestedResult = userWithAddress.address.city;
const correctCopy = {
  ...userWithAddress,
  address: { ...userWithAddress.address }
};
correctCopy.address.city = "Shymkent";

showTask("5. Values and References", [
  ["After copy.score = 20", `Original score is ${sameReferenceResult}`],
  ["Why", "copy and original point to the same object"],
  ["Spread copy", `Original: ${original.score}, copy: ${separateCopy.score}`],
  ["Nested spread result", `Original city changed to ${nestedResult}`],
  ["Why nested value changed", "Spread makes a shallow copy. The address object is still shared."],
  ["Correct nested copy", `Original: ${userWithAddress.address.city}, copy: ${correctCopy.address.city}`]
]);

// 6. Functions
function isEven(number) {
  return number % 2 === 0;
}

function getFullName(firstName, lastName) {
  return `${firstName} ${lastName}`;
}

const calculatePrice = (price, quantity) => price * quantity;
const calculateDiscount = (price, percent) => price - price * percent / 100;
const getMax = (a, b) => a > b ? a : b;
const isEvenArrow = number => number % 2 === 0;

showTask("6. Functions", [
  ["isEven(8)", isEven(8)],
  ["Arrow isEven(7)", isEvenArrow(7)],
  ["Full name", getFullName("Abylau", "Bakkeldi")],
  ["Price", calculatePrice(500, 3)],
  ["Discount", calculateDiscount(1000, 20)],
  ["Maximum", getMax(12, 7)]
]);

// 7. A function can be passed as a value.
const add = (a, b) => a + b;
const multiply = (a, b) => a * b;
const calculate = (a, b, operation) => operation(a, b);

showTask("7. Functions as Values", [
  ["calculate with add", calculate(5, 3, add)],
  ["calculate with multiply", calculate(5, 3, multiply)],
  ["Functions as values", "Yes, functions can be stored in variables and passed to other functions."],
  ["add and add()", "add is the function. add() calls the function and gives its result."]
]);

// 8. Scope
const scopeLines = [];
const message = "global";
scopeLines.push(message);

function checkScope() {
  const message = "function";
  scopeLines.push(message);
  if (true) {
    const message = "block";
    var oldVariable = "var is visible in the function";
    let blockLet = "let stays in the block";
    const blockConst = "const stays in the block";
    scopeLines.push(message, blockLet, blockConst);
  }
  scopeLines.push(oldVariable);
}
checkScope();

showTask("8. Scope", [
  ["Printed values", text(scopeLines)],
  ["Global scope", "A global value can be used in many parts of the program."],
  ["Function scope", "A function value can be used only inside that function."],
  ["Block scope", "let and const inside a block stay inside the block."],
  ["var, let and const", "var ignores block scope. let can change. const cannot be assigned again."]
]);

// 9. Each counter remembers its own count.
function createCounter() {
  let count = 0;
  return () => {
    count += 1;
    return count;
  };
}

const counter = createCounter();
const counterResults = [counter(), counter(), counter()];
const secondCounter = createCounter();

function createAdder(value) {
  return number => value + number;
}
const addFive = createAdder(5);

showTask("9. Closure", [
  ["First counter", text(counterResults)],
  ["Second counter", secondCounter()],
  ["addFive", `${addFive(10)}, ${addFive(20)}`],
  ["Why it works", "The inner function remembers variables from the outer function."]
]);

// 10. Destructuring, spread and rest
const spreadNumbers = [10, 20, 30, 40];
const [first, second] = spreadNumbers;
const baseUser = { id: 1, name: "Anna", age: 21 };
const { name: baseName, age: baseAge } = baseUser;
const numbersWithFifty = [...spreadNumbers, 50];
const olderUser = { ...baseUser, age: 22 };
const userWithEmail = { ...baseUser, email: "anna@example.com" };
const combined = [...spreadNumbers, ...[50, 60]];
const sum = (...values) => values.reduce((result, value) => result + value, 0);

showTask("10. Destructuring, Spread and Rest", [
  ["First two", `${first}, ${second}`],
  ["User values", `${baseName}, ${baseAge}`],
  ["Add 50", text(numbersWithFifty)],
  ["New user age", text(olderUser)],
  ["Add email", text(userWithEmail)],
  ["Combined arrays", text(combined)],
  ["Rest sum", `${sum(1, 2)} and ${sum(1, 2, 3, 4)}`],
  ["Spread and rest", "Spread opens values. Rest collects many values into one array."]
]);

// 11. Optional chaining and default values
const cityUsers = [
  { name: "Dana", address: { city: "Almaty" } },
  { name: "Timur" }
];
const cityResults = cityUsers.map(person => person.address?.city ?? "City not specified");
const compareValues = [0, "", false, null, undefined].map(value => ({
  value: text(value),
  or: value || "default",
  nullish: value ?? "default"
}));

showTask("11. Optional Chaining and Default Values", [
  ["Direct city access", cityUsers[0].address.city],
  ["Cities", text(cityResults)],
  ["|| and ??", text(compareValues)],
  ["What I noticed", "|| uses the default for all falsy values. ?? uses it only for null and undefined."]
]);

// Final task
const finalStudents = [
  { id: 1, name: "Anna", age: 20, grades: [80, 90, 85] },
  { id: 2, name: "John", age: 21, grades: [55, 60, 65] },
  { id: 3, name: "Sara", age: 19, grades: [95, 92, 96] },
  { id: 4, name: "Mike", age: 22, grades: [70, 72, 68] },
  { id: 5, name: "Dana", age: 20, grades: [40, 50, 45] }
];

const getAverage = grades => grades.reduce((sum, grade) => sum + grade, 0) / grades.length;
const getStudentAverage = student => getAverage(student.grades);
const getPassedStudents = students => students.filter(student => getStudentAverage(student) >= 60);
const getStudentNames = students => students.map(student => student.name);
const findStudent = (students, id) => students.find(student => student.id === id);
const getTopStudent = students => students.reduce((top, student) =>
  getStudentAverage(student) > getStudentAverage(top) ? student : top
);

const finalResult = finalStudents.map(student => ({
  id: student.id,
  name: student.name,
  average: Number(getStudentAverage(student).toFixed(2)),
  passed: getStudentAverage(student) >= 60
}));

showTask("Final Task", [
  ["Student names", text(getStudentNames(finalStudents))],
  ["Passed students", getPassedStudents(finalStudents).map(student => student.name).join(", ")],
  ["Find ID 4", text(findStudent(finalStudents, 4))],
  ["Top student", getTopStudent(finalStudents).name],
  ["Final array", text(finalResult)],
  ["What I learned", "Modern array methods help me make new data without changing the original data."]
]);
