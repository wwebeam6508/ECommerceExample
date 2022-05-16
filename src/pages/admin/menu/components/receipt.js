import moment from "moment"
import React, { forwardRef, useState } from "react"
import { useSelector } from "react-redux"
import { getUser } from "../../../../redux/slices/authSlice"
import './receipt.scss'
function Receipt(props, ref) {

    const [detail , setDetail] = useState(props.order)
    const user_detail = useSelector(getUser)

    return(
        <>

            <div ref={ref} className="page-content container">
                <div className="page-header text-blue-d2">
                    <h1 className="page-title text-secondary-d1">
                        Invoice
                        <small className="page-info">
                            <i className="fa fa-angle-double-right text-80"></i>
                            ID: #{detail.uid}
                        </small>
                    </h1>
                </div>

                <div className="container px-0">
                    <div className="row mt-4">
                        <div className="col-12 col-lg-12">
                            <div className="row">
                                <div className="col-12">
                                    <div className="text-center text-150">
                                        <i className="fa fa-book fa-2x text-success-m2 mr-1"></i>
                                        <span className="text-default-d3">{user_detail.name}</span>
                                    </div>
                                </div>
                            </div>

                            <hr className="row brc-default-l1 mx-n1 mb-4" />

                            <div className="row">
                                <div className="col-sm-6">
                                    <div>
                                        <span className="text-sm text-grey-m2 align-middle">To:</span>
                                        <span className="text-600 text-110 text-blue align-middle">{detail.byName}</span>
                                    </div>
                                    <div className="text-grey-m2">
                                        <div className="my-1">
                                            {detail.byAddress}
                                        </div>
                                        <div className="my-1"><i className="fa fa-phone fa-flip-horizontal text-secondary"></i> <b className="text-600">{detail.byPhone}</b></div>
                                    </div>
                                </div>

                                <div className="text-95 col-sm-6 align-self-start d-sm-flex justify-content-end">
                                    <hr className="d-sm-none" />
                                    <div className="text-grey-m2">
                                        <div className="mt-1 mb-2 text-secondary-m1 text-600 text-125">
                                            Invoice
                                        </div>

                                        <div className="my-2"><i className="fa fa-circle text-blue-m2 text-xs mr-1"></i> <span className="text-600 text-90">ID:</span> #{detail.uid}</div>

                                        <div className="my-2"><i className="fa fa-circle text-blue-m2 text-xs mr-1"></i> <span className="text-600 text-90">วันที่:</span>{ moment(new Date()).format('DD/MM/YYYY')}</div>

                                        {/* <div className="my-2"><i className="fa fa-circle text-blue-m2 text-xs mr-1"></i> <span className="text-600 text-90">Status:</span> <span className="badge badge-warning badge-pill px-25">จ่ายแล้ว</span></div> */}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4">

                        <div className="table-responsive">
                            <table className="table table-striped table-borderless border-0 border-b-2 brc-default-l1">
                                <thead className="bg-none bgc-default-tp1">
                                    <tr className="text-white">
                                        <th>Description</th>
                                        <th>จำนวน</th>
                                        <th>ราคาต่อหน่วย</th>
                                        <th width="140">รวมราคาทั้งสิ้น</th>
                                    </tr>
                                </thead>

                                <tbody className="text-95 text-secondary-d3">
                                    <tr></tr>
                                    <tr>
                                        <td>{detail.name}</td>
                                        <td>{detail.count}</td>
                                        <td className="text-95">{detail.price}</td>
                                        <td className="text-secondary-d2">{detail.price * detail.count}</td>
                                    </tr> 
                                </tbody>
                            </table>
                        </div>

                                <div className="row mt-3">

                                    <div className="col-12 col-sm-5 text-grey text-90 order-first order-sm-last">
                                        <div className="row my-2">
                                            <div className="col-7 text-right">
                                                ราคาสินค้า
                                            </div>
                                            <div className="col-5">
                                                <span className="text-120 text-secondary-d1">{detail.price * detail.count}</span>
                                            </div>
                                        </div>

                                        <div className="row my-2">
                                            <div className="col-7 text-right">
                                                ภาษี Vat (7%)
                                            </div>
                                            <div className="col-5">
                                                <span className="text-110 text-secondary-d1">{(detail.price * detail.count) * 0.07}</span>
                                            </div>
                                        </div>

                                        <div className="row my-2 align-items-center bgc-primary-l3 p-2">
                                            <div className="col-7 text-right">
                                                ราคารวมภาษี
                                            </div>
                                            <div className="col-5">
                                                <span className="text-150 text-success-d3 opacity-2">{(detail.price * detail.count) * 1.07}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <hr />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
    
}
export default forwardRef(Receipt)