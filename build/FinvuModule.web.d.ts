import { NativeModule } from 'expo';
import { FinvuModuleEvents } from './Finvu.types';
declare class FinvuModule extends NativeModule<FinvuModuleEvents> {
    PI: number;
    setValueAsync(value: string): Promise<void>;
    hello(): string;
}
declare const _default: typeof FinvuModule;
export default _default;
//# sourceMappingURL=FinvuModule.web.d.ts.map