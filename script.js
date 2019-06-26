python`
    def sayHello(msg):
        euler.write("Python said: '%s'" %msg)
        euler.write("Mean is: '%s'" %euler.mean([1, 2, 3]))
    
    sayHello("Hi jp!");
`;

const sayHello = msg => print(`Eulerscript said: ${msg}`);

sayHello("Hello!");
