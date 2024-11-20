export type TabChild = TabListT & { parentindex?: number; icon?: string; component?: any } & { childTab?: TabChild[] };

export type TabListT = {
    index?: number;
    parentindex?: number;
    tabName?: string;
    isActive: boolean;
    children?: boolean;
    disabled?: boolean;
    link?: string;
    icon?: string;
    component?: any;
    childTab?: TabChild[];
};
