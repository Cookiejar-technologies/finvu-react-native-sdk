import { NativeModule } from 'expo';
import { FinvuModuleEvents } from './Finvu.types';
declare class FinvuModule extends NativeModule<FinvuModuleEvents> {
    PI: number;
    hello(): string;
    setValueAsync(value: string): Promise<void>;
}
declare const _default: FinvuModule;
export default _default;
//# sourceMappingURL=FinvuModule.d.ts.map