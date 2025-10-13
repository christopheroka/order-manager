import supabase from '../../utils/supabase'

export async function insertCustomerAndOrder(orderData) {
    const { data, error } = await supabase.rpc(
        'insert_customer_and_order',
        orderData
    )

    if (error) {
        console.log(error)
        return false
    } else {
        return true
    }
}

export async function getTotalProductQtyByDate(dates) {
    const { data, error } = await supabase.rpc(
        'get_total_product_qty_by_date',
        {
            start_date: dates.start_date,
            end_date: dates.end_date,
        }
    )

    if (error) {
        console.log(error)
        return false
    }
    return data
}

export async function getAllProductsData() {
    const { data: products, error } = await supabase
        .from('products')
        .select('*')
        .order('product_id', 'asc')

    if (error) {
        console.log(error)
    }

    return products
}

export async function getOrderCounts(dates) {
    const { data, error } = await supabase.rpc('get_order_counts', {
        start_date: dates.start_date,
        end_date: dates.end_date,
    })
    if (error) {
        console.log(error)
        return false
    }
    return data
}

export async function getAllData(dates) {
    const { data, error } = await supabase.rpc('get_all_order_data', {
        start_date: dates.start_date,
        end_date: dates.end_date,
    })

    if (error) {
        console.log(error)
    }

    return data
}

export async function getOrderByUid(order_uid) {
    const { data, error } = await supabase.rpc('get_order_by_uid', {
        retrieval_order_uid: order_uid,
    })

    if (error) {
        console.log(error)
    }

    return data
}

export async function getProductNames() {
    const { data, error } = await supabase
        .from('products')
        .select('product_name, product_id, product_price, product_img_api_path')
        .order('product_id', 'asc')

    if (error) {
        console.log(error)
    }

    return data
}

export async function updateTableData(table_data, uid, col_name, order_cost) {
    const customers_columns = [
        'customer_name',
        'email',
        'phone',
        'address',
        'city',
    ]
    const orders_columns = [
        'delivery_date',
        'has_paid',
        'is_verified',
        'payment_type',
        'additional_information',
        'order_cost',
        'misc_fees',
        'creation_timestamp',
    ]

    let table_name = 'order_items'
    let match_columns = { order_uid: uid, product_id: col_name }
    let column_name = 'quantity'
    let inserted_data = table_data || 0

    if (customers_columns.includes(col_name)) {
        table_name = 'customers'
        match_columns = { customer_uid: uid }
        column_name = col_name
        inserted_data = table_data || '-'
    } else if (orders_columns.includes(col_name)) {
        table_name = 'orders'
        match_columns = { order_uid: uid }
        column_name = col_name
        inserted_data = table_data || '-'
    }
    const updateCols = {
        [column_name]: inserted_data,
    }
    if (table_name === 'order_items') {
        const { data, error } = await supabase.rpc('update_order_item', {
            update_order_uid: uid,
            update_product_id: col_name,
            update_quantity: inserted_data || 0,
            update_order_cost: order_cost,
        })
        if (error) {
            console.log(error)
            return false
        }
    } else {
        if (table_name === 'orders' && column_name !== 'is_verified') {
            updateCols.is_verified = false
        }
        const { data, error } = await supabase
            .from(table_name)
            .update(updateCols)
            .match(match_columns)
        if (error) {
            console.log(error)
            return false
        }
    }

    return true
}

export async function deleteOrder(order_uid) {
    const { data, error } = await supabase.rpc('delete_order', {
        deletion_order_uid: order_uid,
    })
    if (error) {
        console.log(error)
        return false
    }
    return true
}

export async function updateVerificationStatus(order_uid, isChecked) {
    const { data, error } = await supabase
        .from('orders')
        .update({
            is_verified: isChecked,
        })
        .match({ order_uid })
    if (error) {
        console.log(error)
        return false
    }
    return true
}

export async function updatePaymentStatus(order_uid, isChecked) {
    const { data, error } = await supabase
        .from('orders')
        .update({
            has_paid: isChecked,
        })
        .match({ order_uid })
    if (error) {
        console.log(error)
        return false
    }
    return true
}

export async function updateEmailSentStatus(order_uid, isChecked) {
    const { data, error } = await supabase
        .from('orders')
        .update({
            email_sent: isChecked,
        })
        .match({ order_uid })
    if (error) {
        console.log(error)
        return false
    }
    return true
}

export async function getAllMaterials() {
    const { data, error } = await supabase.rpc('get_all_materials')

    if (error) {
        console.log(error)
        return false
    }
    return data
}

export async function addMaterialQuantity(material_uid, quantity, cost) {
    const { data, error } = await supabase.from('material_quantities').insert([
        {
            material_uid,
            quantity,
            cost,
        },
    ])

    if (error) {
        console.log(error)
        return false
    }
    return true
}

export async function addMaterial(material_name) {
    const { data, error } = await supabase.from('materials').insert([
        {
            material_name,
        },
    ])

    if (error) {
        console.log(error)
        return false
    }
    return true
}

export async function setEmailedStatus(order_uid) {
    const { data, error } = await supabase
        .from('orders')
        .update({
            email_sent: true,
            is_verified: true,
        })
        .match({ order_uid })
    if (error) {
        console.log(error)
        return false
    }
    return true
}

export async function getSpendingByDay(start_date, end_date) {
    const { data, error } = await supabase.rpc('get_spending_by_day', {
        start_date,
        end_date,
    })

    if (error) {
        console.log(error)
        return false
    }
    return data
}
