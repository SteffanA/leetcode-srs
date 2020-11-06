import React, { useEffect } from 'react'
import { connect } from 'react-redux'
import * as listActions from '../../store/actions/lists'

export const ListsViewer = (props) => {
    // Deconstruct our props
    const {
        getPublicLists,
    } = props

    // Get all public lists
    useEffect(() => {
        get
    }, [input])

    return (
        <div>
            
        </div>
    )
}

const mapStateToProps = (state) => ({
    
})

const mapDispatchToProps = (dispatch) => {
    return  {
        getPublicLists: () => dispatch(listActions.listsGetAllPublic()),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ListsViewer)
