'use strict';

/**
 *  product-category controller
 */

const { createCoreController } = require('@strapi/strapi').factories;
// const strapi = require('@strapi/strapi');

module.exports = createCoreController('api::product-category.product-category', ({ strapi }) => ({
    async getCategories(ctx) {
        let categories = await strapi.service('api::product-category.product-category').find();

        categories = await this.sanitizeOutput(categories, ctx);
        let categoryList = categories.results;
        for (let i = 0; i < categoryList.length; i++) {
            categoryList[i].products = [];
        }

        categoryList.sort(function (a, b) {
            var nameA = !a.parent_name ? a.name : a.parent_name;
            var nameB = !b.parent_name ? b.name : b.parent_name;
            if (nameA > nameB) {
                return 1;
            }
            else if (nameA < nameB) {
                return -1;
            }
            return 0;
        })

        /** Getting Demo's Products maximum same parent depth and target */
        let depthList = [];
        let categoryGroup = [];

        for (let i = 0; i < categoryList.length; i++) {
            if (categoryList[i].parent_name) {
                let tmp = categoryList[i].parent_name.concat(',');
                tmp = tmp.concat(categoryList[i].name);
                categoryGroup.push(tmp.split(','));
            }
            else {
                categoryGroup.push([categoryList[i].name]);
            }
        }

        for (let i = 0; i < categoryGroup.length; i++) {
            let depthListItem = {
                "target": [],
                "value": ""
            };
            let count = 0;
            for (let j = 0; j < i; j++) {
                let tmp = 0;
                for (; tmp < categoryGroup[j].length; tmp++) {
                    if (categoryGroup[j][tmp] !== categoryGroup[i][tmp]) break;
                }

                if (tmp > count) {
                    depthListItem.target = [];
                    count = tmp;
                    for (let k = 0; k < tmp; k++) {
                        depthListItem.target.push(categoryGroup[j][k])
                    }
                }
            }
            depthListItem.value = count;
            depthList.push(depthListItem);
        }

        /** Getting Sidebar's List */
        let sidebarList = [];
        for (let i = 0; i < categoryList.length; i++) {
            let tmp = {
                "id": -1,
                "name": "",
                "slug": "",
                "children": [],
                "disabled": true
            };
            if (!categoryList[i].parent_name) {
                tmp.id = categoryList[i].id;
                tmp.name = categoryList[i].name;
                tmp.slug = categoryList[i].slug;
                tmp.children = [];
                let flag = false;
                for (let j = 0; j < sidebarList.length; j++) {
                    if (sidebarList[j].slug === tmp.slug) {
                        flag = true;
                    }
                }
                if (!flag) sidebarList.push(tmp);
            } else {
                let parents = categoryList[i].parent_name;
                parents = parents.split(',');

                tmp.id = categoryList[i].id;
                tmp.name = categoryList[i].name;
                tmp.slug = categoryList[i].slug;
                tmp.children = [];

                for (let j = parents.length - depthList[i].value - 1; j >= 0; j--) {
                    let tmp1 = {
                        "id": -1,
                        "name": "",
                        "slug": "",
                        "children": [],
                        "disabled": true
                    };

                    tmp1.name = parents[j];
                    let parentCategory = parents[j];
                    let grandParentCategory = "";
                    if (j === 0) grandParentCategory = null;
                    else {
                        for (let k = 0; k < j; k++) {
                            grandParentCategory = grandParentCategory.concat(parents[k]);
                            if (k + 1 !== j) grandParentCategory = grandParentCategory.concat(',');
                        }
                    }
                    let parentSlug = await strapi.entityService.findMany('api::product-category.product-category', {
                        filters: {
                            parent_name: grandParentCategory
                        }
                    });

                    tmp1.id = parentSlug.id;
                    tmp1.slug = parentSlug.slug;
                    tmp1.children.push(tmp);
                    tmp = tmp1;
                }

                let path = [];
                let checkList = sidebarList;
                let target = sidebarList;

                for (let j = 0; j < depthList[i].value; j++) {
                    checkList.map((item, index) => {
                        if (depthList[i].target[j] === item.name) {
                            path.push(index);
                            target = item.children;
                        }
                    })
                    checkList = target;
                }

                if (path.length === 1) {
                    sidebarList[path[0]].children.push(tmp);
                } else if (path.length === 2) {
                    sidebarList[path[0]].children[path[1]].children.push(tmp);
                } else if (path.length === 3) {
                    sidebarList[path[0]].children[path[1]].children[path[2]].children.push(tmp);
                } else {
                    sidebarList.push(tmp);
                }
                /**
                 * You Can add more line if you want to make category list's depth more bigger.
                 */
            }
        }

        return { 'sidebarList': sidebarList };
    },

    async hello() {
        console.log("all hello");
        return "hello";
    }
}));