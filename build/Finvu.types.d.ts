import type { StyleProp, ViewStyle } from 'react-native';
export type OnLoadEventPayload = {
    url: string;
};
export type FinvuModuleEvents = {
    onChange: (params: ChangeEventPayload) => void;
};
export type ChangeEventPayload = {
    value: string;
};
export type FinvuViewProps = {
    url: string;
    onLoad: (event: {
        nativeEvent: OnLoadEventPayload;
    }) => void;
    style?: StyleProp<ViewStyle>;
};
//# sourceMappingURL=Finvu.types.d.ts.map