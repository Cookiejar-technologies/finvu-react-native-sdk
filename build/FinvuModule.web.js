import { registerWebModule, NativeModule } from 'expo';
class FinvuModule extends NativeModule {
    PI = Math.PI;
    async setValueAsync(value) {
        this.emit('onChange', { value });
    }
    hello() {
        return 'Hello world! 👋';
    }
}
export default registerWebModule(FinvuModule, 'FinvuModule');
//# sourceMappingURL=FinvuModule.web.js.map